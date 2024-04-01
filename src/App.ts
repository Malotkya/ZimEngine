/** /App
 * 
 * @author Alex Malotky
 */
import Route from "./Router/Route";
import {IncomingMessage, ServerResponse} from "http";
import Context from "./Context";
import {Handler} from "./Router/Layer";
import HttpError from "./HttpError";
import View from "./View";
import { BodyParser, Body } from "./BodyParser";

/** Engine Type
 * 
 */
type Engine = (incoming:IncomingMessage, response:ServerResponse) => void;

/** Error Handler
 * 
 */
export type ErrorHandler = (err:any, ctx:Context)=>Promise<void>|void;

/** App Engine
 * 
 */
export default class App extends Route{
    #engine:Engine;
    #notFound:Handler;
    #errorHandler:ErrorHandler;
    #view:View|undefined;

    /** Constructor
     * 
     */
    constructor(){
        super(undefined, undefined);

        /** Main Engine
         * 
         * Done this way so that 'this' references this instance.
         */
        this.#engine = (incoming:IncomingMessage, response:ServerResponse) => {
            let parse = new BodyParser(incoming.headers);

            incoming.pipe(parse)
                .on("end", ()=>{
                    const ctx = new Context(incoming, response, parse.body, this.#view);
                    this.handle(ctx)
                        .catch((err)=>{
                            if(typeof err === "number")
                                err = new HttpError(err);
                            this.#errorHandler(err, ctx);
                        }).finally(()=>ctx.flush());
                });
        } 

        /** Defult 404 Handler
         * 
         */
        this.#notFound = (ctx:Context) => {throw 404};

        /** Default Error Handler
         * 
         */
        this.#errorHandler = (err:any, ctx:Context) => {
            const {
                status = 500,
                message = err || "An Unknown Error Occured!"
            } = err;

            ctx.status(status);

            const contentType:string = ctx.request.headers["content-type"] || "unkown";
            if(contentType.includes("json")) {
                ctx.json({status, message});
            } else if(contentType.includes("html")) {
                ctx.html(message);
            } else {
                ctx.text(message);
            }
        }
    }

    /** Handle Request Override
     * 
     * @param {Context} context 
     */
    async handle(context:Context){
        await super.handle(context);
        if( context.nothingSent() )
            this.#notFound(context);
    }

    /** Not Found Setter
     * 
     * @param {Handler} callback 
     */
    notFound(callback:Handler){
        if(typeof callback !== "function")
            throw new TypeError("Handler must be a function!");
        this.#notFound = callback;
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

    /** View Setter
     * 
     * @param {View} view
     */
    view(view:View){
        this.#view = view;
        this.use(View.route, View.getFile);
    }
}