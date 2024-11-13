/** /Engine/Routing/Layer.ts
 * 
 * @author Alex Malotky
 */
import Context from "../Context";
import { pathToRegexp, Key, PathToRegexpOptions } from "path-to-regexp";
import { joinPath } from "../Util";

export type Middleware = (context:Context)=>Promise<void>|void;

export default class Layer {
    private _shortcut:boolean;
    private _handler:Middleware;
    private _regex:RegExp;
    private _keys:Array<Key>;
    private _path:string;
    private _prefix:string;
    private _opts:PathToRegexpOptions;

    constructor(middleware:Middleware)
    constructor(path:string, middleware:Middleware)
    constructor(path:string, opts:PathToRegexpOptions, middleware:Middleware)
    constructor(){
        this._path = "/";
        this._opts = {}
        this._prefix = "";

        switch(arguments.length){
            case 0:
                throw new Error("No arguments passed to layer!");
                
            case 1:
                if(typeof arguments[0] !== "function")
                    throw new TypeError("Middleware must be a function!");

                this._handler = arguments[0];
                break;

            case 2:
                if(typeof arguments[0] !== "string")
                    throw new TypeError("Path must be a string!");
                if(typeof arguments[1] !== "function")
                    throw new TypeError("Middleware must be a function!");

                this._handler = arguments[1];
                this._path = arguments[0];
                break;

            default:
                if(typeof arguments[0] !== "string")
                    throw new TypeError("Path must be a string!");
                if(typeof arguments[1] !== "object")
                    throw new TypeError("Options must be an object!");
                if(typeof arguments[2] !== "function")
                    throw new TypeError("Middleware must be a function!");

                this._handler = arguments[2];
                this._path = arguments[0];
                this._opts = arguments[1];
                break;
        }
        if( this._path === "*"){
            this._shortcut = true;
            this._path += "path";
        } else if(this._path === "/"){
            this._shortcut = this._opts.end === false
        } else {
            this._shortcut = false;
        }

        const {regexp, keys} = pathToRegexp(this._path, this._opts);
        this._regex = regexp;
        this._keys = keys;
    }

    async handle(context:Context):Promise<void>{
        try {
            if(this.match(context)) {
                await this._handler(context);
            }
        } catch (e){
            throw e;
        }
    }

    protected match(context:Context):boolean {
        if(this._shortcut){
            return true;
        }


        const match = context.url.pathname.match(this._regex);
        if(match == null)
            return false;

        
        for(let index=1; index<match.length; index++){
            context.params.set(this._keys[index-1].name, decodeURIComponent(match[index]))
        }

        context.query = context.url.pathname.replace(match[0], "");
        return true;
    }

    get path():string {
        return this._path;
    }

    set path(value:string) {
        this._path = value;
        this._shortcut = false;
        value = joinPath(this._prefix, this._path);
        const {regexp, keys} = pathToRegexp(value, this._opts);
        this._keys = keys;
        this._regex = regexp;
    }

    totalPath():string {
        return joinPath(this._prefix, this._path);
    }

    prefix(value:string) {
        this._prefix = value;
        value = joinPath(value, this._path);
        const {regexp, keys} = pathToRegexp(value, this._opts);
        this._keys = keys;
        this._regex = regexp;
    }

    update(value:PathToRegexpOptions){
        this._opts = value;
        const {regexp, keys} = pathToRegexp(this._path, value);
        this._keys = keys;
        this._regex = regexp;
    }
}