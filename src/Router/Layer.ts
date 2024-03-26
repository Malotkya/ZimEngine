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

    private static init(path:string, options:any, handler:Handler|Layer):Layer {
        if(handler instanceof Layer){
            return new Layer(path, options, handler._handler);
        } else if(typeof handler === "function"){
            return new Layer(path, options, handler);
        } else {
            throw new TypeError("Unknown Handler Type!");
        }
    }

    /** Filter Arguments
     * 
     * filter(args[1]:string|Layer|Handler, args[2]:Handler|Array<Handler>)
     * 
     * @param {Array<any>} args 
     * @returns {Layer}
     */
    protected filter(args:Array<any>):Layer|Array<Layer>{
        let path: string;
        let handler: Handler|Layer|Array<Handler|Layer>;

        const type0 = typeof args[0];
        const type1 = typeof args[1];

        switch (args.length){
            case 0:
                throw new Error("No arguments given!");

            case 1:
                if(type0 === "function" || type1 === "object"){
                    path = "";
                    handler = args[0];
                } else {
                    throw new TypeError("Middleware must by either a Layer or Handler Function");
                }
                break;

            case 2:
                path = String(args[0]);

                if(type1 === "function" || type1 === "object"){
                    path = "";
                    handler = args[1];
                } else {
                    throw new TypeError("Middleware must by either a Layer or Handler Function");
                }
                break;
                
            default:
                path = String(args.shift());
                handler = args;
        }
    
        if(Array.isArray(handler)){
            return handler.map(h=>Layer.init(path, this._options, h))
        }
        return Layer.init(path, this._options, handler);
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
            if(match[index])
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