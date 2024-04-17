import fs from "fs";
import path from "path";
import Context from "./Context";
import MimeTypes from "./MimeTypes";

export default function Static(directory:string){
    if(typeof directory !== "string")
        throw new TypeError("Directory must be a string!");

    if(fs.statSync(directory).isFile())
        throw new Error("Given path is a file!");

    return function serveStatic(ctx:Context):Promise<void>{
        const target:string = path.join(directory, decodeURI(ctx.query));
        const contentType = MimeTypes(target.substring(target.lastIndexOf(".")));

        return new Promise((resolve, reject)=>{
            if(!fs.existsSync(target) || !fs.statSync(target).isFile())
                return resolve();

            ctx.response.setHeader("Content-Type", contentType)
            fs.createReadStream(target)
                .on("data", (chunk:string|Buffer)=>{
                    ctx.write(chunk.toString());
                }).on("error", (err:any)=>{
                    reject(err);
                }).on("close", ()=>{
                    resolve();
                })
        });
        
    }
}