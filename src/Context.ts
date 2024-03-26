/** /Context
 * 
 * @author Alex Malotky
 */
import {IncomingMessage as Request, ServerResponse as Response} from "http";
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

    /** Constructor
     * 
     * @param request 
     * @param response 
     */
    constructor(request: Request, response: Response){

        //Getter Only Variables
        this.#request = request;
        this.#response = response;
        this.#url = new URL(request.url || "", `http://${request.headers.host}`);

        //Params Search Values
        this.#search = {};
        for(const [name, value] of this.#url.searchParams.entries())
            this.#search[name] = value;

        //Defaults
        this.#params = Object.create(this.#search);
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
        this.#params = Object.create(this.#search);

        for(let name in value){
            this.#params[name] = String(value[name]);
        }
    }

    /** Params Getter
     * 
     */
    get params():Dictionary<string>{
        return this.#params;
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
            this.#response.setHeader('Content-Type', 'application/text');
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

    /** Done
     * 
     */
    done() {
        this.#response.end();
    }
}