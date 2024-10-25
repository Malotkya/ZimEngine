
/** /BodyParser
 * 
 * @author Alex Malotky
 */
import { IncomingMessage } from "http";
import { isCloudflareRequest } from "./Util";

const DEFAULT_TIME_LIMIT = 60000000; //One Minute;
const DEFAULT_SIZE_LIMIT = 500000000; //500MB

export type BodyData = Map<string, string>;
type RawBodyData = Map<string, string|Blob>;

/** Clean Body Data
 * 
 * @param {RawBodyData} data 
 * @returns {Promise<BodyData>}
 */
export async function cleanBodyData(data: RawBodyData):Promise<BodyData> {
    for(let [key, value] of data){
        if(value instanceof Blob){
            data.set(key, await value.text());
        }
    }

    //@ts-ignore
    return data;
}

/** Process Cloudflare Request
 * 
 * @param {Request} request 
 * @returns {Promise<RawBodyData>}
 */
function processCloudflareRequest(request:Request):Promise<RawBodyData> {
    return new Promise(res=>{
        if(request.headers.get("Content-Type")?.includes("FormData") === false) {
            return res(new Map());
        }

        request.formData().then((data)=>{
            const map = new Map<string, string|Blob>();
            data.forEach((value, key)=>{
                map.set(key, value);
            });

            res(map)
        }).catch(e=>{
            console.warn(e);
            res(new Map());
        })
    });
}

/** Process Node Request
 * 
 * @param {IncomingMessage} request 
 * @returns {Promise<RawBodyData>}
 */
function processNodeRequest(request:IncomingMessage):Promise<RawBodyData> {
    let multipart:boolean = false;
    let boundry:RegExp    = new RegExp("&");

    const type = request.headers["content-type"];
    if(type && type.indexOf("multipart/form-data") >= 0) {
        multipart = true;
        const match = type.match(/\w+$/);
        if(match === null)
            throw new Error("Header is malformed.");
        boundry = new RegExp("-+"+match[0]); 
    }
    let buffer = "";
    let output = new Map();

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
        let headers:Dictionary<string> = {};
        data = data.substring(match[0].length);
        
        //Parse Headers
        for(const header of match[0].split(/;|\n/g)){
            if(header.trim() !== "") {
                const [name, value] = header.split(/:|=/g);
                if(value.indexOf('"') >= 0){
                    headers[name.trim()] = value.substring(1, value.length-2);
                } else {
                    headers[name.trim()] = value.trim();
                }
            }
        }
    
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
        output.set(name, value);
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

    return new Promise((resolve)=>{
        request.on("data", chunk=>{
            try {
                buffer += String(chunk);
                if(buffer.length >= DEFAULT_SIZE_LIMIT)
                    throw new Error("Upload size limit reached!");
                processBuffer();
            } catch (err){
                console.warn(err);
                resolve(new Map())
            }
            
        });

        request.on("error", (err)=>{
            console.warn(err);
            resolve(new Map());
        });

        request.on("end", ()=>{
            resolve(output);
        });

        setTimeout(()=>{
            console.warn(new Error("Upload timeout limit reached!"));
            resolve(new Map());
        }, DEFAULT_TIME_LIMIT);
    });
}

export default async function BodyParser(request:IncomingMessage|Request):Promise<BodyData>{
    return cleanBodyData(
        isCloudflareRequest(request)
            ? (await processCloudflareRequest(request))
            : (await processNodeRequest(request))
    )
}