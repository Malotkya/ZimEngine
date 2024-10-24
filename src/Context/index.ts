/** /Engine/Context
 * 
 * @author Alex Malotky
 */
import View, {RenderUpdate} from "../View";
import ProtoResponse from "./ProtoResponse";
import Authorization from "Engine/Authorization";
import { HEADER_KEY, HEADER_VALUE } from "Engine/Util";

const HTML_MIME_TYPE = "text/html";
const TXT_MIME_TYPE  = "text/plain";
const JSON_MIME_TYPE = "application/json";

/** Context
 * 
 * Wrapper Around Request/Response
 */
export default class Context{
    private _request:Request;
    private _response:ProtoResponse;
    private _url:URL;
    private _env:Env;
    private _view:View|undefined;
    private _auth:Authorization|undefined;
    private _form:Map<string, string>;

    private _search:Map<string, string>;
    private _params:Map<string, string>;
    private _query:string|undefined;

    /** Constructor
     * 
     * @param request 
     * @param response 
     */
    constructor(request: Request, data:FormData, env:Env, view?:View, auth?:Authorization){
        this._request = request;
        this._response = new ProtoResponse();
        this._env = env;
        this._url = new URL(request.url);
        this._view = view;
        this._auth = auth;

        //Defaults
        this._search = new Map();
        this._params = new Map();
        this._form = new Map();

        //Search Values
        for(const [name, value] of this._url.searchParams.entries())
            this._search.set(name, value);

        //Form Value
        data.forEach((value, key)=>{
            this._form.set(key, value.toString())
        });
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
    get response():ProtoResponse {
        return this._response;
    }

    /** Form Data Getter
     * 
     */
    get formData():Map<string, string> {
        return this._form;
    }

    /** Environment Getter
     * 
     */
    get env():Env {
        return this._env;
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

    /** Params Getter
     * 
     */
    get params():Map<string, string>{
        return this._params;
    }

    /** Search Getter
     * 
     */
    get search():Map<string, string>{
        return this._search;
    }

    /** Set Status Code
     * 
     * @param {number} value 
     * @returns {this}
     */
    status(value:number):this {
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

    /** Write Chunk to Response
     * 
     * @param {any} chunk 
     * @returns {this}
     */
    write(chunk:any):this {
        this._response.write(chunk);
        return this;
    }

    /** End Response
     * 
     */
    end():void {
        this._response.end();
    }

    /** Set Json Content
     * 
     * @param {Object} object 
     * @returns {this}
     */
    json(object:Object):this{
        if (!this._response.headers.get("Content-Type")) {
            this._response.headers.set('Content-Type', JSON_MIME_TYPE);
        }
        this._response.write(JSON.stringify(object));
        this._response.end();
        return this;
    }

    /** Set Text Content
     * 
     * @param {string} value 
     * @returns {this}
     */
    text(value:string):this{
        if (!this._response.headers.get("Content-Type")) {
            this._response.headers.set('Content-Type', TXT_MIME_TYPE);
        }
        this._response.write(value);
        this._response.end();
        return this;
    }

    /** Set HTML Content
     * 
     * @param {string} value 
     * @returns {this}
     */
    html(value:string): Context{
        if (!this._response.headers.get("Content-Type")) {
            this._response.headers.set('Content-Type', HTML_MIME_TYPE);
        }
        this._response.write(value);
        this._response.end();
        return this;
    }

    /** Expects Render
     * 
     * Checks headers to test if request is expecting render object.
     * 
     * @returns {boolean}
     */
    expectsRender():boolean {
        return this._request.headers.get(HEADER_KEY) === HEADER_VALUE;
    }

    /** Reunder Update Content
     * 
     * @param {ContentUpdate} value 
     */
    render(value:RenderUpdate){
        if(this._view === undefined)
            throw new Error("No view to render with!");
        this._response.headers.set(HEADER_KEY, HEADER_VALUE);

        if(this.expectsRender()) {
            this.json(this._view.update(value));
        } else {
            this.html(this._view.render(value));
        }
    }

    /** Flush Update Content
     * 
     */
    flush():Promise<Response> {
        return this._response.flush();
    }

    /** Query Getter
     * 
     */
    get query():string {
        if(this._query !== undefined) {
            if(this._query === "")
                return "/";
            return this._query;
        }
            
        return this.url.pathname;
    }

    /** Query Setter
     * 
     */
    set query(value:string){
        if(typeof value !== "string")
            throw new TypeError("Query must be a string!");

        if(value === "")
            value = "/";

        this._query = value;
    }

    /** Get Authorization
     * 
     * @returns {Promise<User|null>}
     */
    async getAuth():Promise<User|null> {
        if(this._auth === undefined || this._auth.get() === undefined)
            return null;

        return await this._auth.get()(this._request);
    }

    async setAuth(user:User|null):Promise<void> {
        if(this._auth === undefined || this._auth.set() === undefined)
            return;

        await this._auth.set()(this._response, user);
    }

    /** Redirect
     * 
     * @param url 
     * @param status 
     */
    redirect(url:string|URL, status?:number){
        if(url === "back"){
            url = this._request.headers.get("Referrer") || "/";
        }
        
        if(this._request.headers.get(HEADER_KEY) === HEADER_VALUE){
            if(url instanceof URL){
                url = url.pathname;
            }

            this.render({
                redirect: url
            })
        } else {

            if(typeof url === "string"){
                url = new URL(this._request.url.replace(/(^https?:\/\/.*?:\d{0,4})(.*)$/, "$1"+url));
            }
            this._response.redirect(url, status);

        }
    }
}