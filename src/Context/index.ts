/** /Context
 * 
 * @author Alex Malotky
 */
import IncomingRequest, {RequestType} from "./IncomingRequest"
import ResponseType, {ResponseInit} from "./OutgoingResponse";
import View, {RenderUpdate, Content} from "../View";
import MimeTypes from "../MimeTypes";
import {HeadersInit} from "../Util";
import { ServerResponse } from "http";

export{IncomingRequest, ResponseType as OutgoingResponse};

const HTML_MIME_TYPE = MimeTypes("html");
const TXT_MIME_TYPE  = MimeTypes("txt");
const JSON_MIME_TYPE = MimeTypes("json");

/** Context
 * 
 * Wrapper Around Request/Response
 */
export default class Context{
    private _request:RequestType;
    private _response:ResponseType;
    private _url:URL;
    
    private _htmlHeaders:Dictionary<string>;
    private _htmlContent:Array<Content>;

    private _search:Dictionary<string>;
    private _params:Dictionary<string>;
    private _view:View|undefined;
    private _query:string|undefined;


    /** Constructor
     * 
     * @param request 
     * @param response 
     */
    constructor(request: RequestType, response?: ServerResponse, view?:View){

        this._request = request;
        this._response = new ResponseType(response);

        this._url = new URL(request.url || "/", `http://${request.headers.get("host")}`);

        //Search Values
        this._search = {};
        for(const [name, value] of this._url.searchParams.entries())
            this._search[name] = value;


        //Defaults
        this._params = {};
        this._htmlHeaders = {};
        this._htmlContent = [];
        this._view = view;
    }

    get request():RequestType {
        return this._request;
    }

    get response():ResponseType {
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
    get method():string {
        return this._request.method;
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
        
        this._response.status = value;
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
        this._response.write(String(chunk));;
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
    flush():ResponseInit {
        if(this._htmlContent.length > 0){
            if(typeof this._view === "undefined")
                throw new Error("No View to render content!");

            const contentType = this._request.headers.get("content-type");
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

        return this._response.end();
    }

    nothingSent():boolean {
        if(this._htmlContent.length > 0)
            return false;

        return !this._response.headersSent;
    }

    authorization():{username:string,password:string}|undefined{
        const auth = this._request.headers.get("authorization");
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