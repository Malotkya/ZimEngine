/** /Engine
 * 
 * @author Alex Malotky
 */
import Routing from "./Routing";
import Layer from "./Routing/Layer";
import Context from "./Context";
import View from "./View";
import { EndPoint, Middleware } from "./Routing/Layer";
import Authorization from "./Authorization";
import RenderEnvironment from "./View/RenderEnvironment";


//Exports
import Router from "./Routing/Router";
import { createElement } from "./View/Html/Element";
import Content from "./View/Html/Content";
import HttpError from "./HttpError";
export {Router, Context, createElement, HttpError, View};
export type {Content, Middleware, RenderEnvironment};

export default class Engine extends Routing {
    private _view:View|undefined;
    private _auth:Authorization|undefined;

    constructor(){
        super();
    }

    view(value:View){
        if( !(value instanceof View) )
            throw new Error("Value must be an instance of View!");

        this._view = value;
    }

    auth(value:Authorization) {
        if( !(value instanceof Authorization) )
            throw new TypeError("Value must be an instance of Authorization!");

        if(typeof value.get() !== "function")
            throw new TypeError("Authentication Getter is not set!");

        if(typeof value.set() !== "function")
            throw new TypeError("Authentication Setter is not set!");

        this._auth = value;
    }

    async fetch(request:Request, env:Env):Promise<Response> {

        const asset = await env.ASSETS.fetch(request.clone());

        if(asset.status < 400)
            return asset;

        let data:FormData|undefined;
        try {
            data = await request.formData()
        } catch (e){
            data = new FormData();
        }

        return await this.handle(new Context(request, data, env, this._view, this._auth,));
    }

    use(handler:Middleware|EndPoint|Layer): void
    use(path:string, endpoint:EndPoint|Layer):void
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