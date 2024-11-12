import { nodeImport } from "./Util";
import MimeTypes from "./MimeTypes";
import Context from "./Context";
import OutgoingResponse from "./Context/OutgoingResponse";
import Layer from "./Routing/Layer";
import { joinPath } from "./Util";

export default function Static(route:string, dir:string):Layer {
    const fs   = nodeImport("fs");
    const path = nodeImport("node:path");

    function pipeWrappper(file:string, response:OutgoingResponse):Promise<void>{
        return new Promise((res)=>{
            fs.createReadStream(file)
                .pipe(response)
                .on("close", res);
        });
    }

    return new Layer(joinPath(route, "/*query"), {end: false}, async function handleStaticFile(ctx:Context){
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
    });
}

