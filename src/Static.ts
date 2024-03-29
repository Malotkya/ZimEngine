import fs from "fs";
import path from "path";
import Context from "./Context";

export default function Static(directory:string){
    if(typeof directory !== "string")
        throw new TypeError("Directory must be a string!");

    if(fs.statSync(directory).isFile())
        throw new Error("Given path is a file!");

    return function serveStatic(ctx:Context){
        const target:string = path.resolve(directory, ctx.url.pathname);

        if(!fs.existsSync(target) || fs.statSync(target).isDirectory())
            throw 404;

        ctx.file(target);
    }
}