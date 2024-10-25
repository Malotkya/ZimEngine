/** /Engine/Routing/Layer.ts
 * 
 * @author Alex Malotky
 */
import Context from "../Context";
import Layer, {Middleware} from "./Layer";
import { joinPath } from "../Util";

const ROUTER_ERROR = ()=>{throw new Error("_handler called from Router!")}

/** Method Stack
 * 
 */
class Stack extends Array<{name:string, layer:Layer}>{

    /** Add Method Layer
     * 
     * @param {string} name 
     * @param {Layer} layer 
     */
    add(name:string, layer:Layer){
        this.push({name, layer});
    }
}

/** Router
 * 
 */
export default class Router extends Layer{
    protected _methods:Stack;

    /** Constructor
     * 
     * @param {any} options 
     */
    constructor(path:string = "/") {
        super(path, {end: false}, ROUTER_ERROR);
        this._methods = new Stack();
    }

    /** Handle Request Override
     * 
     * @param {Context} context 
     */
    async handle(context:Context):Promise<void> {
        if(this.match(context) !== null){

            for(const {name, layer} of this._methods) {
                if(name === "MIDDLEWARE"){
                    await layer.handle(context);
                    if(context.response.commited())
                        return;
                } else if(name === context.method || name === "ALL") {
                    await layer.handle(context);
                    if(context.response.commited())
                        return;
                } 
            }
    
            throw 404;
        }
    }

    private _filter(args:IArguments):Layer {
        switch(typeof args[0]){
            case "object":
                return args[0];

            case "function":
                return new Layer("/", args[0])

            case "string":
                switch(typeof args[1]) {
                    case "function":
                        return new Layer(args[0], args[1]);

                    case "object":
                        args[1].path = joinPath(args[0], args[1].path)
                        return args[1];

                    default:
                        throw new TypeError("Middlware must be a function or Layer!");
                }
                    
            default:
                throw new TypeError("Path must be a string!");
        }
    }

    /** Use Middleware Method
     * 
     */
    use(middleware:Middleware|Router){
        switch(typeof middleware){
            case "function":
                this._methods.add("MIDDLEWARE", new Layer("*", middleware));
                break;

            case "object":
                if(middleware instanceof Router) {
                    this._methods.add("MIDDLEWARE", middleware);
                    break;
                }

            default:
                throw new TypeError("Invalid middleware!");
        }
    }

    /** Get Method
     * 
     * @param {string} path 
     * @param {EndPoint} handler
     * @returns {Router}
     */
    get(handler:Middleware):Router
    get(path:string, handler:Middleware):Router
    get():Router{
        this._methods.add("GET", this._filter(arguments));
        return this;
    }

    /** Head Method
     * 
     * @param {string} path 
     * @param {EndPoint} handler
     * @returns {Router}
     */
    head(handler:Middleware):Router
    head(path:string, handler:Middleware):Router
    head():Router{
        this._methods.add("HEAD", this._filter(arguments));
        return this;
    }

    /** Post Method
     * 
     * @param {string} path 
     * @param {EndPoint} handler
     * @returns {Router}
     */
    post(handler:Middleware):Router
    post(path:string, handler:Middleware):Router
    post():Router{
        this._methods.add("POST", this._filter(arguments));
        return this;
    }

    /** Put Method
     * 
     * @param {string} path 
     * @param {EndPoint} handler
     * @returns {Router}
     */
    put(handler:Middleware):Router
    put(path:string, handler:Middleware):Router
    put():Router{
        this._methods.add("PUT", this._filter(arguments));
        return this;
    }

    /** Delete Method
     * 
     * @param {string} path 
     * @param {EndPoint} handler
     * @returns {Router}
     */
    delete(handler:Middleware):Router
    delete(path:string, handler:Middleware):Router
    delete():Router{
        this._methods.add("DELETE", this._filter(arguments));
        return this;
    }

    /** Options Method
     * 
     * @param {string} path 
     * @param {EndPoint} handler
     * @returns {Router}
     */
    options(handler:Middleware):Router
    options(path:string, handler:Middleware):Router
    options():Router{
        this._methods.add("OPTIONS", this._filter(arguments));
        return this;
    }

    /** Patch Method
     * 
     * @param {string} path 
     * @param {EndPoint} handler
     * @returns {Router}
     */
    patch(handler:Middleware):Router
    patch(path:string, handler:Middleware):Router
    patch():Router{
        this._methods.add("PATCH", this._filter(arguments));
        return this;
    }

    /** All Method
     * 
     * @param {string} path 
     * @param {EndPoint} handler
     * @returns {Router}
     */
    all(handler:Middleware):Router
    all(path:string, handler:Middleware):Router
    all():Router{
        this._methods.add("ALL", this._filter(arguments));
        return this;
    }
}