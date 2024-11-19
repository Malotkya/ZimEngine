/** /Routing
 * 
 * @author Alex Malotky
 */
import Context from "../Context";
import Router from "./Router";
import HttpError from "../HttpError";

/** Handler Type
 * 
 */
export type Handler = (context:Context)=>Promise<void>|void;

/** Error Handler Type
 * 
 */
type ErrorHandler = (error:any, context:Context)=>Promise<void>|void;

/** Routing Class
 * 
 * Top Level Wrapper around Router class that 
 * handles errors.
 */
export default class Routing extends Router{
    private notFoundHandler:Handler;
    private errorHandler:ErrorHandler;

    /** Routing Constructor
     * 
     */
    constructor(){
        super("");
        this.notFoundHandler = (ctx:Context) => {throw new HttpError(404, `${ctx.url.pathname} was not found!`)};
        this.errorHandler = (e:any, ctx:Context) => {
            const number = Number(e.statusCode || e.code || e.status);
            ctx.status(isNaN(number)? 500: number).write(e.message || String(e)).end();
        }
    }

    /** Routing Handler Wrappper
     * 
     * Made to easier seperate from routing/not found error handler
     * and normal error handler.
     * 
     * @param {Context} context 
     * @param {any} error
     * @returns {Promise<Response>}
     */
    async route(context:Context, error?:any):Promise<Response|undefined>{
        try {
            if(error)
                throw error;

            await this.handle(context);
        } catch (e){
            await this.errorHandler(e, context);
        }

        return await context.flush();
    }

    /** Handle Routing Override
     * 
     * @param {Context} context 
     * @returns {Promise<void>}
     */
    async handle(context:Context):Promise<void>{
        try {
            for(const {name, layer} of this._methods){
                if(name === "MIDDLEWARE"){
                    await layer.handle(context);
                    if(context.response.commited())
                        return;
                } else if(name === context.method || name === "ALL") {
                    
                    await layer.handle(context);
                    if(context.response.commited())
                        return;
                }
            }

            await this.notFoundHandler(context);
        } catch (route_err:any){
            if(route_err == 404 || route_err.code == 404 || route_err.status == 404){
                await this.notFoundHandler(context);
            } else {
                throw route_err;
            }
        }
    }

    /** Not Found Handler Setter
     * 
     * @param {Handler} handler 
     */
    notFound(handler:Handler){
        if(typeof handler !== "function")
            throw new TypeError("Not Found Handler must be a function!");

        this.notFoundHandler = handler;
    }

    /** Error Handler Setter
     * 
     * @param {ErrorHandler} handler 
     */
    error(handler:ErrorHandler){
        if(typeof handler !== "function")
            throw new TypeError("Error Handler must be a function!");
        
        this.errorHandler = handler;
    }
}