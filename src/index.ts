/** /Engine
 * 
 * @author Alex Malotky
 */
import Routing from "./Routing";
import Layer from "./Routing/Layer";
import Context, {NodeRequeset, NodeResponse} from "./Context";
import View from "./View";
import { Middleware } from "./Routing/Layer";
import Authorization from "./Authorization";
import RenderEnvironment from "./View/RenderEnvironment";
import { inCloudfareWorker } from "./Util";


//Exports
import Router from "./Routing/Router";
import { createElement } from "./View/Html/Element";
import Content from "./View/Html/Content";
import HttpError from "./HttpError";
import BodyParser from "./BodyParser";
export {Router, Context, createElement, HttpError, View, Authorization};
export type {Content, Middleware, RenderEnvironment};

export default class Engine extends Routing {
    private _view:View|undefined;
    private _auth:Authorization|undefined;
    private _env:Env;

    constructor(){
        super();
        this._env = {};
    }

    /** View Setter
     * 
     * @param {View} value 
     */
    view(value:View){
        if( !(value instanceof View) )
            throw new Error("Value must be an instance of View!");

        if(this._methods.length === 0 || this._methods.at(0)!.layer.path !== View.injectedFileRoute) {
            this._methods.unshift({
                name: "ALL",
                layer: new Layer(View.injectedFileRoute, View.injectFile)
            });
        }
        
        this._view = value;
    }

    /** Auth Setter
     * 
     * @param {View} value 
     */
    auth(value:Authorization) {
        if( !(value instanceof Authorization) )
            throw new TypeError("Value must be an instance of Authorization!");

        if(typeof value.get() !== "function")
            throw new TypeError("Authentication Getter is not set!");

        this._auth = value;
    }

    env(key:string, value:any) {
        if(inCloudfareWorker())
            throw new Error("Cannot setup envrionment in cloudflare worker!");

        this._env[key] = value;
    }

    async fetch(req:Request, env:Env):Promise<Response> {

        if(env.ASSETS){
            const assetResponse = await env.ASSETS.fetch(req.clone());
            if(assetResponse.status < 400)
                return assetResponse;
        }

        return (await this.start(req, undefined, env))!;
    }

    get server() {
        return async(req:NodeRequeset, res:NodeResponse)=>await this.start(req, res);
    }

    private async start(req:Request|NodeRequeset, res:NodeResponse|undefined, env?:Env):Promise<Response|undefined> {
        const body = await BodyParser(req);
        const context = new Context(req, res, body, env || this._env, this._view, this._auth);

        return await this.handle(context);
    }

    use(handler:Middleware|Layer): void
    use(path:string, endpoint:Middleware|Layer):void
    use(){
        switch(arguments.length){
            case 0:
                throw new Error("No arguments were passed to Engine.use!");

            case 1:
                switch(typeof arguments[0]){
                    case "function":
                        super.all(arguments[0]);
                        break;

                    case "object":
                        this._methods.add("ALL", arguments[0]);
                        break;

                    default:
                        throw new Error("Handler must be a function or a Layer!");
                }
                break;

            default:
                switch(typeof arguments[1]){
                    case "function":
                        super.all(arguments[1]);
                        break;

                    case "object":
                        this._methods.add("ALL", arguments[1]);
                        break;

                    default:
                        throw new Error("Handler must be a function or a Layer!");
                }
        }
    }

}