/** /Context
 * 
 * @author Alex Malotky
 */
import {IncomingMessage as Request, ServerResponse as Response} from "http";
import View, {ContentUpdate, Content} from "./View";
import { sleep } from "./Util";
import fs, { ReadStream } from "fs";
import MimeTypes from "./MimeTypes";
export {Request, Response};

/** Context
 * 
 * Wrapper Around Request/Response
 */
export default class Context{
    #request:Request;
    #response:Response;
    #url:URL;
    #search:Dictionary<string>;
    #params:Dictionary<string>;
    #htmlHeaders:Dictionary<string>;
    #htmlContent:Array<Content>;
    #view:View|undefined;
    private _streams:Array<ReadStream>;
    private _query:string|undefined;

    /** Constructor
     * 
     * @param request 
     * @param response 
     */
    constructor(request: Request, response: Response, view?:View){

        //Getter Only Variables
        this.#request = request;
        this.#response = response;
        this.#url = new URL(request.url || "/", `http://${request.headers.host}`);

        //Params Search Values
        this.#search = {};
        for(const [name, value] of this.#url.searchParams.entries())
            this.#search[name] = value;

        //Defaults
        this.#params = {};
        this.#htmlHeaders = {};
        this.#htmlContent = [];
        this.#view = view;
        this._streams = [];
    }

    /** Request Getter
     * 
     */
    get request():Request {
        return this.#request;
    }

    /** Response Getter
     * 
     */
    get response():Response {
        return this.#response;
    }

    /** Url Getter
     * 
     */
    get url():URL {
        return this.#url;
    }

    /** Method Getter
     * 
     */
    get method():string|undefined {
        return this.request.method;
    }

    /** Params Setter
     * 
     */
    set params(value:Dictionary<string>){
        this.#params = Object.create(value);
    }

    /** Params Getter
     * 
     */
    get params():Dictionary<string>{
        return this.#params;
    }

    /** Search Getter
     * 
     */
    get search():Dictionary<string>{
        return this.#search;
    }

    /** Set Status Code
     * 
     * @param {number} value 
     * @returns {Context}
     */
    status(value:number):Context {
        if(typeof value !== "number") {
            value = Number(value);
        }

        if(isNaN(value)) {
            throw new TypeError("Status code must be a nubmer!")
        } else if( value < 100 || value > 999) {
            throw new TypeError("Status code is out of range!");
        }
        
        this.#response.statusCode = value;
        return this;
    }

    /** Set Json Content
     * 
     * @param {Object} object 
     * @returns {Context}
     */
    json(object:Object): Context{
        if (!this.#response.getHeader("Content-Type")) {
            this.#response.setHeader('Content-Type', MimeTypes("json"));
        }
        this.#response.write(JSON.stringify(object));
        return this;
    }

    /** Set Text Content
     * 
     * @param {string} value 
     * @returns {this}
     */
    text(value:string): Context{
        if (!this.#response.getHeader("Content-Type")) {
            this.#response.setHeader('Content-Type', MimeTypes("txt"));
        }
        this.#response.write(value);
        return this;
    }

    /** Set HTML Content
     * 
     * @param {string} value 
     * @returns {this}
     */
    html(value:string): Context{
        if (!this.#response.getHeader("Content-Type")) {
            this.#response.setHeader('Content-Type', MimeTypes("html"));
        }
        this.#response.write(value);
        return this;
    }

    /** Write Chunk
     * 
     * @param {string} chunk 
     * @returns {this}
     */
    write(chunk:any):Context{
        this.#response.write(chunk);
        return this;
    }

    file(name:string):Context{
        if(!fs.existsSync(name))
            throw 404;
        
        const stats = fs.statSync(name);
        const contentType = MimeTypes(name.substring(name.lastIndexOf(".")));
        
        if(stats.isDirectory())
            throw 404;

        this.response.setHeader("Content-Type", contentType)
        this.response.setHeader("Content-Size", stats.size);

        const file = fs.createReadStream(name);
        this._streams.push(file);
        file.pipe(this.response);

        return this;
    }

    /** Reunder Update Content
     * 
     * @param {ContentUpdate} update 
     */
    render(update:ContentUpdate){
        this.#htmlContent.push(update.content);

        for(let name in update.head){
            this.#htmlHeaders[name] = update.head[name];
        }
    }

    /** Flush Update Content
     * 
     */
    async flush():Promise<void> {
        await this.waitForPipes();

        if(this.#htmlContent.length > 0){
            if(typeof this.#view === "undefined")
                throw new Error("No View to render content!");

            const contentType = this.#request.headers["content-type"];
            const update:ContentUpdate = {
                head: this.#htmlHeaders,
                content: this.#htmlContent
            };
        
            if(contentType && contentType.includes("json")) {
                this.json(update);
            } else {
                this.html(this.#view.render(update));
            }
        }

        this.#response.end();
    }

    /** Wait for any File Streams to Close
     * 
     */
    waitForPipes():Promise<void>{
        return new Promise((res, rej)=>{
            const all:Array<Promise<void>> = this._streams.map(async(stream)=>{
                while(!stream.closed)
                    await sleep();
            });

            Promise.all(all).then(()=>res()).catch(rej);
        })
    }

    /** Was Nothing Sent
     * 
     * @returns {boolean}
     */
    nothingSent():boolean {
        if(this.#htmlContent.length > 0 || this._streams.length > 0)
            return false;

        return !this.#response.headersSent;
    }

    authorization():{username:string,password:string}|undefined{
        const auth = this.#request.headers.authorization
        if(auth===undefined)
            return undefined;

        const buffer = Buffer.from(auth.split(" ")[1], 'base64').toString().split(":");
        return {
            username: buffer[0],
            password: buffer[1]
        }
    }

    get query():string {
        if(this._query !== undefined) {
            if(this._query === "")
                return "/";
            return this._query;
        }
            
        return this.url.pathname;
    }

    set query(value:string){
        if(typeof value !== "string")
            throw new TypeError("Query must be a string!");

        this._query = value;
    }
}