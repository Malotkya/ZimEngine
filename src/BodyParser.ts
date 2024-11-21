
/** /BodyParser
 * 
 * @author Alex Malotky
 */
import { IncomingMessage } from "http";
import { isCloudflareRequest } from "./Util";

const DEFAULT_TIME_LIMIT = 60000000; //One Minute;
const DEFAULT_SIZE_LIMIT = 500000000; //500MB

export type BodyData = Dictionary<string|Blob>;

/** Parse Headers from String
 * 
 * @param {string} value 
 */
function parseHeaders(value:string):Dictionary<string> {
    const headers:Dictionary<string> = {};

    for(const header of value.split(/;|\n/g)){
        if(header.trim() !== "") {
            let [name, value] = header.split(/:|=/g);
            if(value === undefined){
                value = "";
            } else {
                value = value.trim();
            }
            if(value.indexOf('"') >= 0){
                headers[name.trim()] = value.substring(1, value.length-1);
            } else {
                headers[name.trim()] = value;
            }
        }
    }

    return headers;
}

/** Process Cloudflare Request
 * 
 * @param {Request} request 
 * @returns {Promise<RawBodyData>}
 */
function processCloudflareRequest(request:Request):Promise<BodyData> {
    return new Promise((res, rej)=>{
        const content = request.headers.get("Content-Type")?.toLocaleLowerCase();
        if (content === undefined || !content.includes("form-data")) {
            return res({});
        }

        request.formData().then((data)=>{
            const map:BodyData ={};
            data.forEach((value, key)=>{
                map[key] = value;
            });

            res(map)
        }).catch(rej)
    });
}

/** Process Node Request
 * 
 * @param {IncomingMessage} request 
 * @returns {Promise<RawBodyData>}
 */
function processNodeRequest(request:IncomingMessage):Promise<BodyData> {
    let multipart:boolean = false;
    let boundry:RegExp    = new RegExp("&");

    const type = request.headers["content-type"]?.toLocaleLowerCase();
    if(type && type.indexOf("form-data") >= 0) {
        const header = parseHeaders(type);
        if(header["boundary"] === undefined)
            throw new Error("Header is malformed.");
        boundry = new RegExp(header["boundary"].replace(/-+/, "-+"));
        multipart = true;
    }
    let buffer = "";
    let output:BodyData = {};

    /** Process Multipart Data 
     * 
     * @param {string} data 
     * @returns {name:string, info:FileData|string}
     */
    const processMultipartData = (data:string):[string, string|Blob] => {
        //Multipart Headers Match
        const match = data.match(/[\d\D\n]*?\r\n\r\n/);
        if(match === null)
            throw new Error("Malformed Multipart Data!");
    
        //Seperate Header from data/info
        const headers = parseHeaders(match[0])
        data = data.substring(match[0].length);
    
        //Make sure name is found.
        if(headers["name"] === undefined)
            throw new Error("No name given in multipart data!");
    
        //Detect if File
        if(headers["filename"] !== undefined){
            [
                headers["name"],
                new Blob([data], { type: "text/plain" })
            ]
        }

        return [
            headers["name"],
            data
        ]
    }

    /** Takes data as a string and process the information.
     * 
     * @param {string} data 
     */
    const processData = (data:string) => {
        const [name, value] = multipart? processMultipartData(data): data.split("=");
        output[name] = value;
    }

    /** Process Buffer
     * 
     * Loops through the buffer untill all boundrys are crossed.
     */
    const processBuffer = () =>{
        let match = buffer.match(boundry);

        while(match !== null){
            const index = buffer.indexOf(match[0]);

            if(index === 0){
                buffer = buffer.substring(match[0].length);
            } else {
                processData(buffer.slice(0, index));
                buffer = buffer.slice(index+match[0].length)
            }

            match = buffer.match(boundry);
        }
    }

    return new Promise((resolve, reject)=>{

        request.on("data", chunk=>{
            try {
                buffer += String(chunk);
                if(buffer.length >= DEFAULT_SIZE_LIMIT)
                    throw new Error("Upload size limit reached!");
                processBuffer();
            } catch (err){
                reject(err);
            }
            
        });

        request.on("error", reject);

        request.on("end", ()=>{
            resolve(output);
        });

        setTimeout(()=>{
            reject(new Error("Upload timeout limit reached!"));
        }, DEFAULT_TIME_LIMIT);
    });
}

export default async function BodyParser(request:IncomingMessage|Request):Promise<BodyData>{
    return isCloudflareRequest(request)
        ? (await processCloudflareRequest(request))
        : (await processNodeRequest(request))
}