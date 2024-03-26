/** /Router/Layer
 * 
 * @author Alex Malotky
 */
import Context from "../Context";
import Path from "../Path";
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
    #path:Path;
    #initPath:string;

    protected _handler:Handler;

    /** Constructor
     * 
     * @param {string} path 
     * @param {any} options 
     * @param {Handler} handler 
     */
    constructor(path:string = "/", handler:Handler=()=>undefined, override:boolean = false) {
        this.#path = new Path(path, override);
        this.#initPath = path;
        this._handler = handler;
    }

    private static init(path:string, handler:Handler|Layer):Layer {
        if(handler instanceof Layer){
            return new Layer(path, handler._handler);
        } else if(typeof handler === "function"){
            return new Layer(path, handler);
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
            return handler.map(h=>Layer.init(path, h))
        }
        return Layer.init(path, handler);
    }

    async handle(path:string, context:Context) {
        if(this.match(path, context))
            await this._handler(context);
    }

    /** Match Route
     * 
     * @param {Context} context 
     * @returns {bollean}
     */
    match(path:string, context:Context):string|undefined{
        let match = this.#path.match(path);

        if(match === null)
            return undefined;

        context.params = match.params;
        return match.path.value;
    }

    /** Path Getter
     * 
     */
    public get path():string {
        return this.#path.value;
    }
}