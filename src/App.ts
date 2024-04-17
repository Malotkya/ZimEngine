/** /App
 * 
 * @author Alex Malotky
 */
import Route from "./Router/Route";
import {IncomingMessage, ServerResponse} from "http";
import IncomingRequest, {RequestType} from "./Context/IncomingRequest";
import { ResponseInit } from "./Context/OutgoingResponse";
import Context from "./Context";
import HttpError from "./HttpError";
import View from "./View";

/** Engine Type
 * 
 */
type Engine = (incoming:IncomingMessage, response:ServerResponse) => Promise<void>;

/** Error Handler
 * 
 */
export type ErrorHandler = (err:any, ctx:Context)=>Promise<void>|void;

/** Expected Logger Interface.
 * 
 */
interface Logger {
    log(...data: any[]):void,
    error(...data: any[]):void
}

/** App Engine
 * 
 */
export default class App extends Route{
    #engine:Engine;
    #errorHandler:ErrorHandler;
    #view:View|undefined;
    _logger:Logger;

    /** Constructor
     * 
     */
    constructor(logger:Logger = console){
        super(undefined, undefined);
        this._logger = logger;

        /** Main Engine
         * 
         * Done this way so that 'this' references this instance.
         */
        this.#engine = async(incoming:IncomingMessage, response:ServerResponse) => {
            await this.fetch(new IncomingRequest(incoming), response);
        } 

        /** Default Error Handler
         * 
         */
        this.#errorHandler = (err:any, ctx:Context) => {
            const {
                status = 500,
                message = err || "An Unknown Error Occured!"
            } = err;

            ctx.status(status);
            ctx.text(message);
        }
    }

    /** Handle Request Override
     * 
     * @param {Context} context 
     */
    async handle(context:Context){
        await super.handle(context);
        if( context.nothingSent() )
            throw 404;
    }

    /** Error Handler Setter
     * 
     * @param {ErrorHandler} callback 
     */
    errorHandler(callback:ErrorHandler){
        if(typeof callback !== "function")
            throw new TypeError("Error Handler must be a function!");
        this.#errorHandler = callback;
    }

    /** Engine Getter
     * 
     */
    get engine():Engine{
        return this.#engine;
    }

    async fetch(request:RequestType, response:any):Promise<Response|undefined> {
        let env:any;

        if(response.ASSETS !== undefined){
            env = response;
            response = undefined;
        }

        //Test for assests
        if(env) {
            const asset:Response = await env.ASSETS.fetch(request);
            if(asset.ok)
                return asset;
        }
        
        let ctx:Context= new Context(request, response, this.#view);
        try {
            await this.handle(ctx);
        } catch(err:any){
            if(typeof err === "number")
                err = new HttpError(err);
            if( !(err instanceof HttpError) )
                    this._logger.error(err);
            await this.#errorHandler(err, ctx);
        }
        const [body, init, redirect] = ctx.flush();

        if(response === undefined){
            if(redirect)
                return Response.redirect(redirect);
            
            return new Response(body, init)
        }
    }

    /** View Setter
     * 
     * @param {View} view
     */
    view(view:View){
        this.#view = view;
        this.use(View.route, View.injectFile);
    }
}