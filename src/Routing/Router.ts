/** /Routing/Layer.ts
 * 
 * @author Alex Malotky
 */
import Context from "../Context";
import Layer, {Middleware} from "./Layer";
import { joinPath } from "../Util";

//Router Error Thrower
const ROUTER_ERROR = ()=>{throw new Error("_handler called from Router!")};

/** Method Stack Class
 * 
 * Wrapper around array to make adding methods to the stack easier.
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

/** Router Layer
 * 
 * Array<Layer> seperated by Method Types.
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

    /** Handle Routing Override
     * 
     * @param {Context} context 
     */
    async handle(context:Context):Promise<void> {
        if(this.match(context)){

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
        }
    }

    /** Filter Arguments into Layer
     * 
     * @param {IArguments} args 
     * @returns {Layer}
     */
    private _filter(args:IArguments):Layer {
        let output:Layer;
        switch(typeof args[0]){
            case "function":
                output = new Layer("/", args[0]);
                break;

            case "string":
                switch(typeof args[1]) {
                    case "function":
                        output = new Layer(args[0], args[1]);
                        break;

                    case "object":
                        if(args[1] instanceof Layer) {
                            output = args[1];
                            output.path = joinPath(args[0], args[1].path)
                            break;
                        }

                    default:
                        throw new TypeError("Middlware must be a function or Layer!");
                }
                break;

            case "object":
                    if(args[0] instanceof Layer) {
                        output = args[0];
                        break;
                    }
                    throw new TypeError("Middleware object must be an instance of Layer.");
                    
            default:
                throw new TypeError("Path must be a string!");
        }
        
        output.prefix(this.totalPath());
        return output;
    }

    /** Set Prefix Override
     * 
     * @param {string} value 
     */
    prefix(value:string){
        super.prefix(value);
        for(const {layer} of this._methods){
            layer.prefix(this.totalPath());
        }
    }

    /** Use Middleware Method
     * 
     * @param {Middleware|Router} middleware
     * @returns {this}
     */
    use(middleware:Middleware|Router):this
    use():this{
        this._methods.add("MIDDLEWARE", this._filter(arguments));
        return this;
    }

    /** Add Get Method Handler
     * 
     * @param {string} path  = "/"
     * @param {Middleware|Layer} handler
     * @returns {this}
     */
    get(handler:Middleware):this
    get(path:string, handler:Middleware):this
    get():this{
        this._methods.add("GET", this._filter(arguments));
        return this;
    }

    /** Add Head Method Handler
     * 
     * @param {string} path  = "/"
     * @param {Middleware|Layer} handler
     * @returns {this}
     */
    head(handler:Middleware):this
    head(path:string, handler:Middleware):this
    head():this{
        this._methods.add("HEAD", this._filter(arguments));
        return this;
    }

    /** Add Post Method Handler
     * 
     * @param {string} path  = "/"
     * @param {Middleware|Layer} handler
     * @returns {this}
     */
    post(handler:Middleware):this
    post(path:string, handler:Middleware):this
    post():this{
        this._methods.add("POST", this._filter(arguments));
        return this;
    }

    /** Add Set Method Handler
     * 
     * @param {string} path  = "/"
     * @param {Middleware|Layer} handler
     * @returns {this}
     */
    put(handler:Middleware):this
    put(path:string, handler:Middleware):this
    put():this{
        this._methods.add("PUT", this._filter(arguments));
        return this;
    }

    /** Add Delete Method Handler
     * 
     * @param {string} path  = "/"
     * @param {Middleware|Layer} handler
     * @returns {this}
     */
    delete(handler:Middleware):this
    delete(path:string, handler:Middleware):this
    delete():this{
        this._methods.add("DELETE", this._filter(arguments));
        return this;
    }

    /** Add Options Method Handler
     * 
     * @param {string} path  = "/"
     * @param {Middleware|Layer} handler
     * @returns {this}
     */
    options(handler:Middleware):this
    options(path:string, handler:Middleware):this
    options():this{
        this._methods.add("OPTIONS", this._filter(arguments));
        return this;
    }

    /** Add Patch Method Handler
     * 
     * @param {string} path  = "/"
     * @param {Middleware|Layer} handler
     * @returns {this}
     */
    patch(handler:Middleware):this
    patch(path:string, handler:Middleware):this
    patch():this{
        this._methods.add("PATCH", this._filter(arguments));
        return this;
    }

    /** Add All Method Handler
     * 
     * @param {string} path  = "/"
     * @param {Middleware|Layer} handler
     * @returns {this}
     */
    all(handler:Middleware):this
    all(path:string, handler:Middleware):this
    all():this{
        this._methods.add("ALL", this._filter(arguments));
        return this;
    }
}