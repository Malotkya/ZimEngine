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
import BodyParser from "./BodyParser";
import util from "util";

/** Engine Type
 * 
 */
type Engine = (incoming:IncomingMessage, response:ServerResponse) => Promise<void>;

/** Error Handler
 * 
 */
export type ErrorHandler = (err:any, ctx:Context)=>Promise<void>|void;

/** Context Initalizer Wrapper
 * 
 * Attempts to initalizes the context with the BodyParser(), if it fails it will return the error instead of throwing an error.
 * 
 * @param {IncomingMessage} incomingMessage 
 * @param {ServerResponse} serverResponse 
 * @param {View} view 
 * @returns {Context|Error}
 */
async function contextWrapper(incomingMessage:IncomingMessage, serverResponse:ServerResponse, view:View|undefined):Promise<any>{
    try {
        return new Context(incomingMessage, serverResponse, await BodyParser(incomingMessage), view);
    } catch (err:any){
        return err;
    }
}

/** Expected Logger Interface.
 * 
 */
interface Logger {
    log(value:string):void,
    error(value:string):void
}

/** App Engine
 * 
 */
export default class App extends Route{
    #engine:Engine;
    #notFound:Handler;
    #errorHandler:ErrorHandler;
    #view:View|undefined;
    _logger:Logger;

    /** Print Format String
     * 
     * @param {Function} callback - Print Function
     * @param {string} format 
     * @param {Array<any>} args 
     */
    private static print(callback:Function, format:string, args:Array<any>):void{
        if(typeof format !== "string"){
            args.unshift(format);
            format = "%o";
        }
        callback(util.format(format, ...args));
    }

    private error(format:any, ...args:Array<any>):void{
        App.print(this._logger.error, format, args);
    }

    private log(format:any, ...args:Array<any>):void{
        App.print(this._logger.log, format, args);
    }

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

            let ctx:Context= await contextWrapper(incoming, response, this.#view);
            try {
                //If error from body parser.
                if( !(ctx instanceof Context) ){ 
                    let err:Error = ctx;
                    ctx = new Context(incoming, response, undefined, this.#view);
                    throw err;
                }
                await this.handle(ctx);

            } catch(err:any){
                if(typeof err === "number")
                    err = new HttpError(err);
                if( !(err instanceof HttpError) )
                    this.error(err);
                await this.#errorHandler(err, ctx);
            } finally {
                await ctx.flush();
            }
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