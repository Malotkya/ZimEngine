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
        super("Main Routing");
        this.notFoundHandler = (ctx:Context) => {throw new HttpError(404, `${ctx.url.pathname} was not found!`)};
        this.errorHandler = (e:any, ctx:Context) => {
            ctx.status(e.statusCode || e.code || e.status || 500).write(e.message || String(e)).end();
        }
    }

    /** Handle Routing
     * 
     * @param {Context} context 
     * @returns {Promise<Response>}
     */
    async handle(context:Context):Promise<Response|undefined>{
        try {
            for(const {name, layer} of this._methods){
                if(name === "MIDDLEWARE"){
                    await layer.handle(context);
                } else if(name === context.method || name === "ALL") {
                    
                    const response = await layer.handle(context);
                    if(response)
                        return response;

                    if(context.response.commited())
                        return await context.flush();
                }
            }

            await this.notFoundHandler(context);
        } catch (route_err:any){
            try {
                if(route_err === 404 || route_err.code === 404 || route_err.status === 404){
                    await this.notFoundHandler(context);
                } else {
                    throw route_err;
                }
            } catch (error){
                await this.errorHandler(error, context);
            }
        }

        return context.flush();
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