/** /Routing
 * 
 * @author Alex Malotky
 */
import Context from "../Context";
import Router from "./Router";

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
            const message = `${status}: ${err.message}`;

            const content = (ctx.request.headers.get("Content-Type") || "").toLocaleLowerCase();

            ctx.status(status);
            if(ctx.expectsRender() || content.includes("html")){
                try {
                    ctx.render({
                        head: {
                            title: message
                        },
                        body: {
                            error: message
                        }
                    });
                } catch (_) {
                    ctx.html(`<html><head><title>${message}</title><style>#error{color: red}</head><body><h1 id="error">${message}</h1></body></html>`)
                }
            } else if(content.includes("json")){
                ctx.json({status, message})
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