/** /Engine/Routing/Layer.ts
 * 
 * @author Alex Malotky
 */
import Context from "../Context";
import { pathToRegexp, Key, PathToRegexpOptions } from "path-to-regexp";

export type Middleware = (context:Context)=>Promise<void>|void;
export type EndPoint = (context:Context)=>Promise<Response|void>|Response|void;

export interface Params{
    [name:string]:string
}

export interface Match {
    path:string
    params:Params
}

export default class Layer {
    private _shortcut:boolean;
    private _handler:Middleware|EndPoint;
    private _regex:RegExp;
    private _keys:Array<Key>;

    constructor(middleware:Middleware)
    constructor(path:string, middleware:Middleware|EndPoint)
    constructor(path:string, opts:PathToRegexpOptions, middleware:Middleware)
    constructor(){
        let path:string = "/";
        let opts:Object = {};

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
    }

    async handle(context:Context):Promise<Response|void>{
        try {
            if(this.match(context)) {
                const response = await this._handler(context);
                if(response)
                    return response;

                if(context.response.commited())
                    return await context.flush();
            }
        } catch (e){
            throw e;
        }
    }

    match(context:Context) {
        if(this._shortcut){
            return true;   
        }

        const match = this._match(context);
        if(match){
            for(let name in match.params){
                context.params.set(name, match.params[name]);
            }

            return true;
        }

        return false;
    }

    protected _match(context:Context):Match|null {
        const result:Params = {};

        const match = context.query.match(this._regex);
        if(match == null)
            return null;

        
        for(let index=1; index<match.length; index++){
            result[this._keys[index-1].name] = decodeURIComponent(match[index]);
        }

        return {
            path: match[0],
            params: result
        };
    }
}