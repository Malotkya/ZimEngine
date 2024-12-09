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

/** Routing Class
 * 
 * Top Level Wrapper around Router class that 
 * handles errors.
 */
export default class Routing extends Router{

    /** Routing Constructor
     * 
     */
    constructor(){
        super("");
        this._errors.set((err, ctx) => {
            const status = isNaN(err.status as number)? 500: Number(err.status);
            const message = String(err.message);

            ctx.status(status);
            if(ctx.expectsRender()){
                ctx.render({
                    body: {
                        error: message
                    }
                });
            } else {
                ctx.write(message);
            }

            ctx.end();
        })
    }

    /** Routing Handler Wrappper
     * 
     * 
     * @param {Context} context 
     * @returns {Promise<Response>}
     */
    async route(context:Context):Promise<Response|undefined>{
        await this.handle(context);
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

            throw 404;
        } catch (err:any){
            this._errors.handle(err, context)
        }
    }

    
}