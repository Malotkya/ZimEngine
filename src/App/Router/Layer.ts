import Context from "../Context";
import {pathToRegexp, Key} from "path-to-regexp";

export type Handler = (context:Context)=>Promise<void>|void;

export default class Layer {
    #regex: RegExp;
    #keys: Array<Key>;
    #path:string;

    _handler:Handler;
    _options:any;

    constructor(path:string = "/", options:any = {}, handler:Handler=()=>undefined) {
        this.#regex = pathToRegexp(path, this.#keys = [], options);
        this.#path = path;
        this._handler = handler;
        this._options = options;
    }

    static init(path:string, options:any, h:Handler|Layer):Layer {
        if(h instanceof Layer){
            h._options = options;
            h.path = path;
            return h;
        } else if(typeof h === "function") {
            return new Layer(path, options, h);
        }

        throw new TypeError(`Unknown handler type '${typeof h}'!`);
    }

    public async handle(context:Context){
        if(this.match(context))
            await this._handler(context);
    }

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

    public set path(value:string){
        this.#regex = pathToRegexp(value, this.#keys = [], this._options);
        this.#path = value;
    }

    public get path():string {
        return this.#path;
    }
}