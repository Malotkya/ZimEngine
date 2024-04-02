
/** /BodyParser
 * 
 * @author Alex Malotky
 */
import { IncomingMessage } from "http";

const DEFAULT_TIME_LIMIT = 60000000; //One Minute;
const DEFAULT_SIZE_LIMIT = 500000000; //500MB

/** File Data Interface
 * 
 */
export interface FileData {
    fileName:string,
    fileContent:Buffer,
    contentType:string,
}

/** Body Type
 * 
 */
export type Body = Map<string, string|FileData>;

export default function BodyParser(request:IncomingMessage):Promise<Body>{
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
    const processMultipartData = (data:string):[string, FileData|string] => {
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
        if(headers["filename"] === undefined){
            return [
                headers["name"],
                data
            ]
        }

        const fileName = headers["filename"];
        const contentType = headers["Content-Type"];
        const fileContent = Buffer.from(data);

        return [
            headers["name"],
            {fileName, contentType, fileContent}
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
            reject(new Error("Upload timeout limit reached!"))
        }, DEFAULT_TIME_LIMIT);
    });
}