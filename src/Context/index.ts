/** /Context
 * 
 * @author Alex Malotky
 */
import View, {RenderUpdate} from "../View";
import OutgoingResponse, {NodeResponse} from "./OutgoingResponse";
import IncomingRequest, {NodeRequeset} from "./IncomingRequest";
import Authorization from "../Authorization";
import MimeTypes from "../MimeTypes";
import { HEADER_KEY, HEADER_VALUE, inCloudfareWorker } from "../Util";
import ObjectValidator, {ObjectProperties} from "../Validation/Object";
import {Object as ObjectType} from "../Validation/Type"
import { TypeOf } from "../Validation";

//Node:Request & Node:Response types.
export type {NodeRequeset, NodeResponse};

const HTML_MIME_TYPE = MimeTypes("html");
const TXT_MIME_TYPE  = MimeTypes("txt");
const JSON_MIME_TYPE = MimeTypes("json");

/** Context
 * 
 * Wrapper Around Request/Response
 */
export default class Context{
    private _request:IncomingRequest;
    private _response:OutgoingResponse;
    private _url:URL;
    private _env:Env;
    private _view:View|undefined;
    private _auth:Authorization|undefined;
    private _query:string;

    private _search:Map<string, string>;
    private _params:Map<string, string>;

    /** Constructor
     * 
     * @param request 
     * @param response 
     */
    constructor(request: NodeRequeset|Request, response:NodeResponse|undefined, env:Env, view?:View, auth?:Authorization){
        this._request = new IncomingRequest(request);
        this._response = new OutgoingResponse(response);
        this._env = env;
        this._url = inCloudfareWorker() //Different URL construtor based on environement.
            ? new URL(this._request.url)
            : new URL(request.url || "/", `http://${this._request.headers.get("host")}`);
        this._view = view;
        this._auth = auth;

        //Defaults
        this._search = new Map();
        this._params = new Map();
        this._query = "/";

        //Search Values
        for(const [name, value] of this._url.searchParams.entries())
            this._search.set(name, value);
    }

    /** Request Getter
     * 
     */
    get request():IncomingRequest {
        return this._request;
    }

    /** Response Getter
     * 
     */
    get response():OutgoingResponse {
        return this._response;
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

    /** Query Getter
     * 
     */
    get query():string {
        return this._query;
    }

    /** Query Setter
     * 
     */
    set query(value:string) {
        if(value.charAt(0) !== "/") {
            value = "/"+value;
        }
        if(value.charAt(value.length-1) === "/")
            value = value.substring(0, value.length-1);
            
        this._query = value;
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
    html(value:string):this{
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
     * @returns {this}
     */
    render(value:RenderUpdate):this{
        if(this._view === undefined)
            throw new Error("No view to render with!");
        this._response.headers.set(HEADER_KEY, HEADER_VALUE);

        if(this.expectsRender()) {
            this.json(this._view.update(value));
        } else {
            this.html(this._view.render(value));
        }

        return this;
    }

    /** Form Data Getter
     * 
     */
    async formData<O extends ObjectType, P extends ObjectProperties<keyof O>>(expected?:ObjectValidator<O, P>):Promise<TypeOf<ObjectValidator<O, P>>>
    async formData():Promise<any>
    async formData(expected?:any):Promise<any>{
        const data = await this._request.formData();

        if(expected)
            return expected.run(data);

        return data;
    }

    /** Flush & Get Response
     * 
     */
    flush():Promise<Response|undefined> {
        return this._response.flush();
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

    /** Set Authorization
     * 
     * @returns {Promise<void>}
     */
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
        
        if(this.expectsRender()){
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