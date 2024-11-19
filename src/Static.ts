/** /Static
 * 
 * @author Alex Malotky
 */
import { nodeImport } from "./Node";
import MimeTypes from "./MimeTypes";
import Context from "./Context";
import OutgoingResponse from "./Context/OutgoingResponse";
import Layer from "./Routing/Layer";
import { joinPath } from "./Util";

/** Static Content Handler
 * 
 * @param {string} route 
 * @param {sting} dir 
 * @returns {Layer}
 */
export default function Static(route:string, dir:string):Layer {
    const fs   = nodeImport("fs");
    const path = nodeImport("node:path");

    /** Pipe File Promise Wrapper 
     * 
     * @param {string} file 
     * @param {OutgoingResponse} response 
     * @returns {Promise<void>}
     */
    function pipeWrappper(file:string, response:OutgoingResponse):Promise<void>{
        return new Promise((res)=>{
            fs.createReadStream(file)
                .pipe(response)
                .on("close", res);
        });
    }

    /** Handle Static File
     * 
     * @param {Context} ctx 
     */
    async function handleStaticFile(ctx:Context){
        if(ctx.method !== "GET" && ctx.method !== "HEAD") {
            return;
        }

        const target:string = path.join(dir, ctx.params.get("query"));

        if( fs.existsSync(target) === false) {
            return;
        }

        const stats = fs.statSync(target);
        if(stats.isDirectory()) {
            return;
        }

        ctx.response.headers.set('Content-Type', MimeTypes(target));
        ctx.response.headers.set("Content-Length", stats.size.toString());
        ctx.response.headers.set('Content-Security-Policy', "default-src 'none'");
        ctx.response.headers.set('X-Content-Type-Options', "nosniff");

        await pipeWrappper(target, ctx.response);
        ctx.end();
    };

    return new Layer(joinPath(route, "/*query"), {end: false}, handleStaticFile);
}

