/** /Router/Layer
 * 
 * @author Alex Malotky
 */
import Context from "../Context";
import {pathToRegexp, Key} from "path-to-regexp";
import {join} from "path";

/** Handler Function Type
 * 
 */
export type Handler = (context:Context)=>Promise<void>|void;

/** Layer Class
 * 
 * Layer of middelware routing structure.
 */
export default class Layer {
    #regex: RegExp;
    #keys: Array<Key>;
    #path:string;
    #initPath:string;

    protected _handler:Handler;
    protected _options:any;

    /** Constructor
     * 
     * @param {string} path 
     * @param {any} options 
     * @param {Handler} handler 
     */
    constructor(path:string = "/", options:any = {}, handler:Handler=()=>undefined) {
        this.#regex = pathToRegexp(path, this.#keys = [], options);
        this.#path = path;
        this.#initPath = path;
        this._handler = handler;
        this._options = options;
    }

    /** Init Layer from Layer/Handler
     * 
     * @param {path} path 
     * @param {any} options 
     * @param {Handler|Layer} h 
     * @returns {Layer}
     */
    static init(path:string, options:any, h:Handler|Layer):Layer {
        if(h instanceof Layer){
            h._options = options;
            h.#initPath = path;
            h.#path = path;
            h.#regex = pathToRegexp(path, h.#keys = [], options);
            return h;
        } else if(typeof h === "function") {
            return new Layer(path, options, h);
        }

        throw new TypeError(`Unknown handler type '${typeof h}'!`);
    }

    /** Handle Request
     * 
     * @param {Context} context 
     */
    public async handle(context:Context){
        if(this.match(context))
            await this._handler(context);
    }

    /** Match Route
     * 
     * @param {Context} context 
     * @returns {bollean}
     */
    private match(context:Context):boolean{
        let match = context.url.pathname.match(this.#regex)

        if(match === null)
            return false;

        let params:Dictionary<string> = {};
        for(let index=1; index<match.length; index++){
            params[this.#keys[index-1].name] = decodeURIComponent(match[index]);
        }

        context.params = params;
        return true;
    }

    /** Path Setter
     * 
     * Updates path to include 
     */
    public set path(value:string){
        this.#path = join(value, this.#initPath);
        this.#regex = pathToRegexp(this.#path, this.#keys = [], this._options);
    }

    /** Path Getter
     * 
     */
    public get path():string {
        return this.#path;
    }
}