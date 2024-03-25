import Route from "./Router/Route";
import {IncomingMessage, ServerResponse} from "http";
import Context from "./Context";
import {Handler} from "./Router/Layer";
import HttpError from "./HttpError";

type Engine = (incoming:IncomingMessage, response:ServerResponse) => void;

export type ErrorHandler = (err:any, ctx:Context)=>Promise<void>|void;

export default class App extends Route{
    #engine:Engine;
    #notFound:Handler;
    #errorHandler:ErrorHandler;

    constructor(){
        super(undefined, undefined);

        this.#engine = (incoming:IncomingMessage, response:ServerResponse) => {
            const ctx = new Context(incoming, response)
            this.handle(ctx)
                .then(()=>ctx.done())
                .catch((err)=>{
                    if(typeof err === "number")
                        err = new HttpError(err);
                    this.#errorHandler(err, ctx);
                })
        }

        this.#notFound = (ctx:Context) => {throw 404};
        this.#errorHandler = (err:any, ctx:Context) => {
            const {
                status = 500,
                message = err || "An Unknown Error Occured!"
            } = err;
            console.error(err);
            ctx.status(status).write(message).done();
        }
    }

    async handle(context:Context){
        await super.handle(context)
        if( !context.response.headersSent )
            this.#notFound(context);
    }

    notFound(callback:Handler){
        if(typeof callback !== "function")
            throw new TypeError("Handler must be a function!");
        this.#notFound = callback;
    }

    errorHandler(callback:ErrorHandler){
        if(typeof callback !== "function")
            throw new TypeError("Error Handler must be a function!");
        this.#errorHandler = callback;
    }

    get engine():Engine{
        return this.#engine;
    }
}