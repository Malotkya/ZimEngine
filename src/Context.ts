/** /Context
 * 
 * @author Alex Malotky
 */
import {IncomingMessage as Request, ServerResponse as Response} from "http";
import View, {ContentUpdate, Content} from "./View";
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
            this.#response.setHeader('Content-Type', 'application/json');
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
            this.#response.setHeader('Content-Type', 'text/plain');
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
            this.#response.setHeader('Content-Type', 'text/html');
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
    flush():void {
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

    /** Was Nothing Sent
     * 
     * @returns {boolean}
     */
    nothingSent():boolean {
        if(this.#htmlContent.length > 0)
            return false;

        return !this.#response.headersSent;
    }
}