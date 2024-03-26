/** /Router
 * 
 * @author Alex Malotky
 */
import Context from "../Context";
import Layer from "./Layer";
import Route from "./Route";

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
    #methods:Stack;

    /** Constructor
     * 
     * @param {any} options 
     */
    constructor(options?:any) {
        super("", options);
        this.#methods = new Stack();
    }

    /** Handle Request Override
     * 
     * @param {Context} context 
     */
    async handle(path:string, context:Context){
        const match = this.match(path, context)
        if(match){
            for(const {name, layer} of this.#methods) {
                if(name === context.method || name === "ALL")
                    layer.handle(match, context);
            }
        }
    }

    /** Filter Arguments
     * 
     * @param {Array<any>} args 
     * @returns {Layer}
     */
    protected filter(args:Array<any>):Layer {
        const middleware = super.filter(args);
        if(Array.isArray(middleware))
            return new Route(this.path, middleware);
        return middleware;
    }

    /** Get Method
     * 
     * @param {string|Array<string>} path 
     * @param {Middleware|Layer} middleware
     * @returns {Router}
     */
    get(...args:Array<any>):Router{
        this.#methods.add("GET", this.filter(args));
        return this;
    }

    /** Get Method
     * 
     * @param {string|Array<string>} path 
     * @param {Middleware|Layer} middleware
     * @returns {Router}
     */
    head(...args:Array<any>):Router{
        this.#methods.add("HEAD", this.filter(args));
        return this;
    }

    /** Get Method
     * 
     * @param {string|Array<string>} path 
     * @param {Middleware|Layer} middleware
     * @returns {Router}
     */
    post(...args:Array<any>):Router{
        this.#methods.add("POST", this.filter(args));
        return this;
    }

    /** Get Method
     * 
     * @param {string|Array<string>} path 
     * @param {Middleware|Layer} middleware
     * @returns {Router}
     */
    put(...args:Array<any>):Router{
        this.#methods.add("PUT", this.filter(args));
        return this;
    }

    /** Get Method
     * 
     * @param {string|Array<string>} path 
     * @param {Middleware|Layer} middleware
     * @returns {Router}
     */
    delete(...args:Array<any>):Router{
        this.#methods.add("DELETE", this.filter(args));
        return this;
    }

    /** Get Method
     * 
     * @param {string|Array<string>} path 
     * @param {Middleware|Layer} middleware
     * @returns {Router}
     */
    options(...args:Array<any>):Router{
        this.#methods.add("OPTIONS", this.filter(args));
        return this;
    }

    /** Get Method
     * 
     * @param {string|Array<string>} path 
     * @param {Middleware|Layer} middleware
     * @returns {Router}
     */
    patch(...args:Array<any>):Router{
        this.#methods.add("PATCH", this.filter(args));
        return this;
    }

    /** Get Method
     * 
     * @param {string|Array<string>} path 
     * @param {Middleware|Layer} middleware
     * @returns {Router}
     */
    all(...args:Array<any>):Router{
        this.#methods.add("ALL", this.filter(args));
        return this;
    }
}