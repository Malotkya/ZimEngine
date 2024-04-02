/** /Context
 * 
 * @author Alex Malotky
 */
import {IncomingMessage as Request, ServerResponse as Response} from "http";
import View, {RenderUpdate, Content} from "./View";
import { sleep } from "./Util";
import fs, { ReadStream } from "fs";
import MimeTypes from "./MimeTypes";
import { Body, FileData } from "./BodyParser";
export {Request, Response};

const HTML_MIME_TYPE = MimeTypes("html");
const TXT_MIME_TYPE  = MimeTypes("txt");
const JSON_MIME_TYPE = MimeTypes("json");

/** Context
 * 
 * Wrapper Around Request/Response
 */
export default class Context{
    private _request:Request;
    private _response:Response;
    private _url:URL;
    private _search:Dictionary<string>;
    private _params:Dictionary<string>;
    private _htmlHeaders:Dictionary<string>;
    private _htmlContent:Array<Content>;
    private _view:View|undefined;
    private _body:Dictionary<string>;
    private _files:Dictionary<FileData>;
    private _streams:Array<ReadStream>;
    private _query:string|undefined;

    /** Constructor
     * 
     * @param request 
     * @param response 
     */
    constructor(request: Request, response: Response, body:Body, view?:View){

        //Getter Only Variables
        this._request = request;
        this._response = response;
        this._url = new URL(request.url || "/", `http://${request.headers.host}`);

        //Search Values
        this._search = {};
        for(const [name, value] of this._url.searchParams.entries())
            this._search[name] = value;

        //Body/File Values
        this._body = {};
        this._files = {};
        for( const [name, value] of body.entries()){
            if(typeof value === "string"){
                this._body[name] = value;
            } else {
                this._body[name] = value.fileName;
                this._files[name] = value;
            }
            
        }

        //Defaults
        this._params = {};
        this._htmlHeaders = {};
        this._htmlContent = [];
        this._view = view;
        this._streams = [];
    }

    /** Request Getter
     * 
     */
    get request():Request {
        return this._request;
    }

    /** Response Getter
     * 
     */
    get response():Response {
        return this._response;
    }

    /** Url Getter
     * 
     */
    get url():URL {
        return this._url;
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
        this._params = Object.create(value);
    }

    /** Params Getter
     * 
     */
    get params():Dictionary<string>{
        return this._params;
    }

    /** Search Getter
     * 
     */
    get search():Dictionary<string>{
        return this._search;
    }

    /** Body Getter
     * 
     */
    get body():Dictionary<string>{
        return this._body;
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
        
        this._response.statusCode = value;
        return this;
    }

    /** Set Json Content
     * 
     * @param {Object} object 
     * @returns {Context}
     */
    json(object:Object): Context{
        if (!this._response.getHeader("Content-Type")) {
            this._response.setHeader('Content-Type', JSON_MIME_TYPE);
        }
        this._response.write(JSON.stringify(object));
        return this;
    }

    /** Set Text Content
     * 
     * @param {string} value 
     * @returns {this}
     */
    text(value:string): Context{
        if (!this._response.getHeader("Content-Type")) {
            this._response.setHeader('Content-Type', TXT_MIME_TYPE);
        }
        this._response.write(value);
        return this;
    }

    /** Set HTML Content
     * 
     * @param {string} value 
     * @returns {this}
     */
    html(value:string): Context{
        if (!this._response.getHeader("Content-Type")) {
            this._response.setHeader('Content-Type', HTML_MIME_TYPE);
        }
        this._response.write(value);
        return this;
    }

    /** Write Chunk
     * 
     * @param {string} chunk 
     * @returns {this}
     */
    write(chunk:any):Context{
        this._response.write(chunk);
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
    render(update:RenderUpdate){
        this._htmlContent.push(update.content);

        for(let name in update.header){
            this._htmlHeaders[name] = update.header[name];
        }
    }

    /** Flush Update Content
     * 
     */
    async flush():Promise<void> {
        await this.waitForPipes();

        if(this._htmlContent.length > 0){
            if(typeof this._view === "undefined")
                throw new Error("No View to render content!");

            const contentType = this._request.headers["content-type"];
            const update:RenderUpdate = {
                header: this._htmlHeaders,
                content: this._htmlContent
            };
        
            if(contentType && contentType.includes("json")) {
                this.json(this._view.update(update));
            } else {
                this.html(this._view.render(update));
            }
        }

        this._response.end();
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
        if(this._htmlContent.length > 0 || this._streams.length > 0)
            return false;

        return !this._response.headersSent;
    }

    authorization():{username:string,password:string}|undefined{
        const auth = this._request.headers.authorization
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