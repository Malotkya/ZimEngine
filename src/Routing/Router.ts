/** /Engine/Routing/Layer.ts
 * 
 * @author Alex Malotky
 */
import Context from "../Context";
import Layer, {EndPoint, Middleware} from "./Layer";

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
    private _path: string;

    /** Constructor
     * 
     * @param {any} options 
     */
    constructor(path:string) {
        super(path, {end: false}, ROUTER_ERROR);
        this._methods = new Stack();
        this._path = path;
    }

    get path(){
        return this._path;
    }

    /** Handle Request Override
     * 
     * @param {Context} context 
     */
    async handle(context:Context):Promise<Response|void> {
        const match = this._match(context);
        const path = context.query;
        context.params.clear();

        if(match){
            context.query = context.query.replace(match.path, "");
            for(let name in match.params){
                context.params.set(name, match.params[name]);
            }

            for(const {name, layer} of this._methods) {
                if(name === "MIDDLEWARE"){
                    const response = await layer.handle(context);
                    if(response)
                        return response
                } else if(name === context.method || name === "ALL") {
                    const response = await layer.handle(context);
                    if(response)
                        return response;
                } 
            }
    
            throw 404;
        }

        context.query = path;
    }

    private _filter(args:IArguments):Layer {
        switch(typeof args[0]){
            case "function":
                return new Layer("/", args[0])

            case "string":
                if(typeof args[1] !== "function")
                    throw new TypeError("Endpoint must be a function!");

                return new Layer(args[0], args[1]);

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
    get(handler:EndPoint):Router
    get(path:string, handler:EndPoint):Router
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
    head(handler:EndPoint):Router
    head(path:string, handler:EndPoint):Router
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
    post(handler:EndPoint):Router
    post(path:string, handler:EndPoint):Router
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
    put(handler:EndPoint):Router
    put(path:string, handler:EndPoint):Router
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
    delete(handler:EndPoint):Router
    delete(path:string, handler:EndPoint):Router
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
    options(handler:EndPoint):Router
    options(path:string, handler:EndPoint):Router
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
    patch(handler:EndPoint):Router
    patch(path:string, handler:EndPoint):Router
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
    all(handler:EndPoint):Router
    all(path:string, handler:EndPoint):Router
    all():Router{
        this._methods.add("ALL", this._filter(arguments));
        return this;
    }
}