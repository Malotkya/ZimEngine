/** /Engine/Routing/Layer.ts
 * 
 * @author Alex Malotky
 */
import Context from "../Context";
import { pathToRegexp, Key, PathToRegexpOptions } from "path-to-regexp";

export type Middleware = (context:Context)=>Promise<void>|void;

export default class Layer {
    private _shortcut:boolean;
    private _handler:Middleware;
    private _regex:RegExp;
    private _keys:Array<Key>;
    private _path:string;

    constructor(middleware:Middleware)
    constructor(path:string, middleware:Middleware)
    constructor(path:string, opts:PathToRegexpOptions, middleware:Middleware)
    constructor(){
        let path:string = "/";
        let opts:PathToRegexpOptions = {
            end: false
        }

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
                path = arguments[0];
                break;

            default:
                if(typeof arguments[0] !== "string")
                    throw new TypeError("Path must be a string!");
                if(typeof arguments[1] !== "object")
                    throw new TypeError("Options must be an object!");
                if(typeof arguments[2] !== "function")
                    throw new TypeError("Middleware must be a function!");

                this._handler = arguments[2];
                path = arguments[0];
                opts = arguments[1];
                break;
        }
        this._shortcut = path === "*";
        if(this._shortcut)
            path += "path";

        const {regexp, keys} = pathToRegexp(path, opts);
        this._regex = regexp;
        this._keys = keys;
        this._path = path;
    }

    async handle(context:Context):Promise<void>{
        try {
            const match = this.match(context);

            if(match !== null) {
                await this._handler(context);
                context.query = match;
            }
        } catch (e){
            throw e;
        }
    }

    protected match(context:Context):string|null {
        if(this._shortcut){
            return "";
        }


        const match = context.query.match(this._regex);
        if(match == null)
            return null;

        
        for(let index=1; index<match.length; index++){
            context.params.set(this._keys[index-1].name, decodeURIComponent(match[index]))
        }

        const path = context.query;
        context.query = context.query.replace(match[0], "");
        return path;
    }

    get path():string{
        return this._path;
    }
}