/** /Engine/Routing
 * 
 * @author Alex Malotky
 */
import Context from "../Context";
import Router from "./Router";
import HttpError from "../HttpError";

type Handler = (context:Context)=>Promise<void>|void;
type ErrorHandler = (error:any, context:Context)=>Promise<void>|void;

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
            ctx.status(e.statusCode || e.code || e.status || 500).write(e.message || String(e)).end();
        }
    }

    /** Routing Wrappper
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

    /** Handle Routing
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
            if(route_err === 404 || route_err.code === 404 || route_err.status === 404){
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