/** /Context
 * 
 * @author Alex Malotky
 */
import View, {RenderUpdate} from "../View";
import OutgoingResponse, {NodeResponse} from "./OutgoingResponse";
import IncomingRequest, {NodeRequeset} from "./IncomingRequest";
import Authorization from "../Authorization";
import MimeTypes from "../MimeTypes";
import { BodyData } from "./BodyParser";
import { HEADER_KEY, HEADER_VALUE } from "../Util";
import DataObject, { TypeOf, ObjectProperties } from "../Validation";
import QueryBuilder from "./QueryBuilder";

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
    private _env:Env;
    private _view:View|undefined;
    private _auth:Authorization|undefined;
    private _path:string;

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
        this._view = view;
        this._auth = auth;

        //Defaults
        this._search = new Map();
        this._params = new Map();
        this._path = this._request.url.pathname;

        //Search Values
        for(const [name, value] of this._request.url.searchParams.entries())
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
        return this._request.url;
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

    /** Path Getter
     * 
     */
    get path():string {
        return this._path;
    }

    /** Path Setter
     * 
     */
    set path(value:string) {
        if(value.charAt(0) !== "/") {
            value = "/"+value;
        }
        if(value.charAt(value.length-1) === "/")
            value = value.substring(0, value.length-1);
            
        this._path = value;
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
     * @param {DataObject} expected 
     * @returns {BodyData}
     */
    async formData<P extends ObjectProperties>(expected:DataObject<P>):Promise<TypeOf<DataObject<P>>>
    async formData():Promise<BodyData>
    async formData<P extends ObjectProperties>(expected?:DataObject<P>):Promise<any>{
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
        if(this.expectsRender()){
            if(url instanceof URL){
                url = url.pathname;
            }

            this.render({
                redirect: url
            })
        } else {

            if(typeof url === "string"){
                url = new URL(url, this._request.url);
            }
            this._response.redirect(url, status);

        }
    }

    /** Database Query Builder
     * 
     * @returns {QueryBuilder}
     */
    query<P extends ObjectProperties>(object:DataObject<P>):QueryBuilder<P> {
        return new QueryBuilder(this._env["DB"] || this._env["db"], object);
    }
}