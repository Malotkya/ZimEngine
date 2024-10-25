import { nodeImport } from "./Util";
import MimeTypes from "./MimeTypes";
import Context from "./Context";

export default function Static(dir:string) {
    const fs   = nodeImport("fs");
    const path = nodeImport("node:path");

    return async function handleStaticFile(ctx:Context){
        if(ctx.method !== "GET" && ctx.method !== "HEAD") {
            return;
        }

        const target:string = path.join(dir, ctx.url.pathname);

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

        fs.createReadStream(target)
            .pipe(ctx.response)
            .on("close", ()=>ctx.end());
    }
}