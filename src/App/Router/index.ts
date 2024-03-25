import Context from "../Context";
import Layer from "./Layer";
import Route from "./Route";

class Stack extends Array<{name:string, layer:Layer}>{
    add(name:string, layer:Layer){
        this.push({name, layer});
    }

    contains(value:string):boolean {
        for(let {name} of this){
            if(name === value)
                return true;
        }

        return false;
    }
}

export default class Router extends Layer{
    #methods:Stack;

    constructor(options?:any) {
        super("", options);
        this.#methods = new Stack();
    }

    async handle(context:Context){
        for(const {name, layer} of this.#methods) {
            if(name === context.method || name === "ALL")
                layer.handle(context);
        }
    }

    set path(value:string){
        for(const {layer} of this.#methods)
            layer.path = value;
    }

    filter(args:Array<any>):Layer {
        let path: string;
        let middleware: Layer;

        //Filter Arguments
        switch (args.length){
            case 0:
                throw new Error("No arguments given!");

            case 1:
                path = "";
                middleware = Layer.init(path, this._options, args[0]);
                break;

            case 2:
                path = args[0];
                middleware = Layer.init(path, this._options, args[1]);
                break;
                
            default:
                path = args.shift();
                middleware = new Route(path, this._options,
                    args.map((value)=>Layer.init(path, this._options, value))
                );
        }

        return middleware;
    }

    get(...args:Array<any>){
        this.#methods.add("GET", this.filter(args));
    }

    head(...args:Array<any>){
        this.#methods.add("HEAD", this.filter(args));
    }

    post(...args:Array<any>){
        this.#methods.add("POST", this.filter(args));
    }

    put(...args:Array<any>){
        this.#methods.add("PUT", this.filter(args));
    }

    delete(...args:Array<any>){
        this.#methods.add("DELETE", this.filter(args));
    }

    options(...args:Array<any>){
        this.#methods.add("OPTIONS", this.filter(args));
    }

    patch(...args:Array<any>){
        this.#methods.add("PATCH", this.filter(args));
    }

    all(...args:Array<any>){
        this.#methods.add("ALL", this.filter(args));
    }
}