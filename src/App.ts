/** /App
 * 
 * @author Alex Malotky
 */
import Route from "./Router/Route";
import {IncomingMessage, ServerResponse} from "http";
import Context from "./Context";
import {Handler} from "./Router/Layer";
import HttpError from "./HttpError";

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
            const ctx = new Context(incoming, response)
            this.handle(ctx.url.pathname, ctx)
                .then(()=>ctx.done())
                .catch((err)=>{
                    if(typeof err === "number")
                        err = new HttpError(err);
                    this.#errorHandler(err, ctx);
                })
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
            ctx.status(status).write(message).done();
        }
    }

    /** Handle Request Override
     * 
     * @param {Context} context 
     */
    async handle(path:string, context:Context){
        await super.handle(path, context)
        if( !context.response.headersSent )
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
}