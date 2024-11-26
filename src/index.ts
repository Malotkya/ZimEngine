/** /Engine
 * 
 * @author Alex Malotky
 */
import Routing from "./Routing";
import Context, {NodeRequeset, NodeResponse} from "./Context";
import View, {RenderUpdate} from "./View";
import { Middleware } from "./Routing/Layer";
import Authorization from "./Authorization";
import RenderEnvironment from "./View/RenderEnvironment";
import { inCloudfareWorker } from "./Util";

//Exports
import Router from "./Routing/Router";
import { createElement } from "./View/Html/Element";
import Content from "./View/Html/Content";
import HttpError from "./HttpError";
export {Router, Context, createElement, HttpError, View, Authorization}
export type {Content, Middleware, RenderEnvironment, RenderUpdate};

/** Engine Class
 * 
 */
export default class Engine extends Routing {
    private _view:View|undefined;
    private _auth:Authorization|undefined;
    private _env:Env;

    /**
     * 
     */
    constructor(){
        super();
        this._env = {};
    }

    /** View Setter
     * 
     * @param {View} value 
     */
    view(value:View, inject:boolean = true){
        if( !(value instanceof View) )
            throw new Error("Value must be an instance of View!");

        if(inject) {
            const layer = value.setUpInjection();
            if(this._methods.length === 0 || this._methods.at(0)!.layer.path !== View.injectFilePath) {
                this._methods.unshift({
                    name: "ALL",
                    layer: layer
                });
            }
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

    /** Environemnt Setter
     * 
     * @param {string} key 
     * @param {any} value
     */
    env(key:string, value:any) {
        if(inCloudfareWorker())
            throw new Error("Cannot setup envrionment in cloudflare worker!");

        this._env[key] = value;
    }

    /** Cloudflare Fetch Response Environment
     * 
     * @param {Request} req 
     * @param {Env} env 
     * @returns {Promise<Response>}
     */
    async fetch(req:Request, env:Env):Promise<Response> {
        if(env.ASSETS){
            const assetResponse = await env.ASSETS.fetch(req.clone());
            if(assetResponse.status < 400)
                return assetResponse;
        }

        return (await this.start(req, undefined, env))!;
    }

    /** Get Node Server Environment
     * 
     */
    get server() {
        return async(req:NodeRequeset, res:NodeResponse)=>await this.start(req, res);
    }

    /** Start of Handler Environment
     * 
     * @param {NodeRequeset|Request} req 
     * @param {NodeResponse|undefined} res 
     * @param {Env} env 
     * @returns {Response|undefined}
     */
    private async start(req:Request|NodeRequeset, res:NodeResponse|undefined, env?:Env):Promise<Response|undefined> {
        return await this.route(new Context(req, res, env || this._env, this._view, this._auth));
    }

}