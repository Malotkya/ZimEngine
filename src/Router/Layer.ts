/** /Router/Layer
 * 
 * @author Alex Malotky
 */
import Context from "../Context";
import {join} from "../Util";
import {pathToRegexp, Key} from "path-to-regexp";

const SUB_LAYER_OPTS = {strict: false, end: false};

/** Handler Function Type
 * 
 */
export type Handler = (context:Context)=>Promise<void>|void;

/** Layer Class
 * 
 * Layer of middelware routing structure.
 */
export default class Layer {
    #regex:RegExp
    #keys:Array<Key>

    protected _handler:Handler;
    protected _path:string;
    protected _options:any;
    protected _shortcut:boolean;

    /** Constructor
     * 
     * @param {string} path 
     * @param {any} options 
     * @param {Handler} handler 
     */
    constructor(path:string = "/", options:any = SUB_LAYER_OPTS, handler:Handler) {
        this.#regex = pathToRegexp(path, this.#keys = [], options);
        this._path = path;
        this._options = options;
        this._handler = handler;
        this._shortcut = path === "/" && options.end === false;
    }

    private static init(path:string, options:any, handler:Handler|Layer):Layer {
        if(handler instanceof Layer){
            handler._options = options;
            handler.path = path;
            return handler;
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
    protected filter(args:Array<any>, options?:any):Layer|Array<Layer>{
        let path: string;
        let handler: Handler|Layer|Array<Handler|Layer>;

        const type0 = typeof args[0];
        const type1 = typeof args[1];

        switch (args.length){
            case 0:
                throw new Error("No arguments given!");

            case 1:
                if(type0 === "function" || type0 === "object"){
                    path = "/";
                    handler = args[0];
                } else {
                    throw new TypeError("Middleware must by either a Layer or Handler Function");
                }
                break;

            case 2:
                if(type1 === "function" || type1 === "object"){
                    path = String(args[0]);
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
            return handler.map(h=>Layer.init(path, options || SUB_LAYER_OPTS, h))
        }
        return Layer.init(path, options || SUB_LAYER_OPTS, handler);
    }

    async handle(context:Context) {
        await this._handler(context);
    }

    /** Match Route
     * 
     * @param {string} path 
     * @returns {bollean}
     */
    match(context:Context):boolean{
        const path:string = context.query;

        if(this._shortcut){
            context.params = {};
            return true;
        }
        const match = path.match(this.#regex);
        if(match === null)
            return false;

        let params:Dictionary<string> = {};
        for(let index=1;index<match.length;index++){
            if(match[index])
                params[this.#keys[index-1].name] = decodeURIComponent(match[index]);
        }

        context.params = params;
        context.query = path.replace(match[0], "");
        return true;
    }

    private set path(value:string){
        this._path = value;
        this.#regex = pathToRegexp(value, this.#keys = [], this._options);
        this._shortcut = value === "/" && this._options.end === false;
    }
}

