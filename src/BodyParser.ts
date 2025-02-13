
/** /BodyParser
 * 
 * @author Alex Malotky
 */
import { IncomingMessage } from "http";
import { isCloudflareRequest } from "./Util";

const DEFAULT_TIME_LIMIT = 60000000; //One Minute;
const DEFAULT_SIZE_LIMIT = 500000000; //500MB

/** Options used by Body Parser
 * 
 */
export interface BodyParserOptions {
    maxSize?:number
    timeout?:number
}

type File = Blob&{fileName:string};
export interface BodyData{
    [key:string]: string|File|undefined
};

/** Parse Headers from String
 * 
 * @param {string} value 
 */
function parseHeaders(value:string):Record<string, string> {
    const headers:Record<string, string> = {};

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

/** Parse Body Parser Options
 * 
 * @param {BodyParserOptions} options 
 * @returns {Required<BodyParserOptions>}
 */
function parseOptions(options:BodyParserOptions):Required<BodyParserOptions> {
    const {maxSize = DEFAULT_SIZE_LIMIT, timeout = DEFAULT_TIME_LIMIT} = options;
    
    if(typeof maxSize !== "number")
        throw new TypeError("Max Download Size must be a number!");

    if(typeof timeout !== "number")
        throw new TypeError("Timeout must be a number!");

    return {maxSize, timeout};
}

/** Process Basic Data
 * 
 * Used to process Basic FormData body.
 * 
 * @param {string} data
 * @returns {[string, string]}
 */
function processBasicData(data:string):[string, string]{
    return data.split("=") as [string, string];
}

/** Process Multipart Form Data
 * 
 * Used to process Multipart FormData body.
 * 
 * @param {string} data
 * @returns {[string, string]}
 */
function processMultipartData(data:string):[string, string]{
    const match = data.match(/[\d\D\n]*?\r\n\r\n/);
    if(match === null)
        throw new Error("Malformed Multipart Data!");

    //Seperate Header from data/info
    const headers = parseHeaders(match[0])
    data = data.substring(match[0].length);

    //Make sure name is found.
    const name = headers["name"];
    if(name === undefined)
        throw new Error("No name given in multipart data!");

    //Detect if File
    if(headers["filename"] !== undefined){
        const file:any = new Blob([data], { type: headers["Content-Type"] || "text/plain" });
        file.fileName = file;

        return [ headers["name"], file ];
    }

    return [ headers["name"], data];
}

/** Body Data Handler
 * 
 * Process the data being pushed into the buffer and creates an object
 * that holds the data.
 */
class BodyDataHandler{
    private _buffer:string;
    private _boundry:RegExp;
    private _processData:(s:string)=>[string, string];
    private _data:BodyData;
    private _total:number;
    private readonly _limit:number;
    private _start:number|undefined;
    private readonly _timeout:number;

    constructor(formData:string|undefined, opts:BodyParserOptions) {
        const {maxSize, timeout} = parseOptions(opts);

        this._buffer = "";
        this._boundry = new RegExp("&");
        this._data = {};
        this._total = 0;
        this._limit = maxSize;
        this._timeout = timeout;

        if(formData && formData.includes("form-data")){
            const header = parseHeaders(formData);
            if(header["boundary"] === undefined)
                throw new Error("Form-Data Header is malformed.");
        
            this._boundry = new RegExp(header["boundary"].replace(/-+/, "-+"));
            this._processData = processMultipartData;

        } else {
            this._boundry = new RegExp("&");
            this._processData = processBasicData;
        }
    }

    /** Push Data to be proccessed.
     * 
     * @param data 
     */
    push(data:string):void {
        
        this._buffer += data;
        this._total += data.length;
        this.process();

        if(this._start){
            if( (Date.now() - this._start) > this._timeout )
                throw new Error("Upload timeout limit reached!");
        } else {
            this._start = Date.now();
        }

        if(this._total > this._limit){
            throw new Error("Upload size limit reached!");
        }
    }

    /** Process Buffer
     * 
     */
    private process() {
        let match = this._buffer.match(this._boundry);

        while(match !== null){
            const index = this._buffer.indexOf(match[0]);

            if(index === 0){
                this._buffer = this._buffer.substring(match[0].length);
            } else {
                const [key, value] = this._processData(this._buffer.slice(0, index));
                (<any>this._data[key]) = value;
                this._buffer = this._buffer.slice(index+match[0].length)
            }

            match = this._buffer.match(this._boundry);
        }
    }

    /** Get Value
     * 
     * @returns {BodyData}
     */
    value():BodyData {
        return this._data;
    }
}

/** Process Cloudflare Request
 * 
 * @param {Request} request 
 * @returns {Promise<BodyData>}
 */
async function processCloudflareRequest(request:Request, opts:BodyParserOptions):Promise<BodyData> {
    return new Promise((res, rej)=>{
        if(request.body === null)
            return rej(new Error("Body is null!"));
    
        if(request.bodyUsed)
            return rej(new Error("Body is already used!"));
    
        let protoParser:BodyDataHandler;
        try {
            protoParser = new BodyDataHandler(request.headers.get("Content-Type")?.toLocaleLowerCase(), opts);
        } catch (e){
            rej(e);
        }
    
        const {writable} = new TransformStream({
            transform(chunk){
                try {
                    protoParser.push(chunk);  
                } catch (e){
                    rej(e);
                }
            }
        });
    
        request.body.pipeTo(writable).then(()=>{
            res(protoParser.value())
        }).catch(rej);
    });
}

interface NodeRequest extends IncomingMessage {
    bodyUsed?:boolean;
}

/** Process Node Request
 * 
 * @param {IncomingMessage} request 
 * @returns {Promise<BodyData>}
 */
function processNodeRequest(request:NodeRequest, opts:BodyParserOptions):Promise<BodyData> {
    return new Promise((res, rej)=>{
        if(request.bodyUsed) {
            return rej(new Error("Body is already used!"));
        }

        let protoParser:BodyDataHandler;
        try {
            protoParser = new BodyDataHandler(request.headers["content-type"]?.toLocaleLowerCase(), opts);
        } catch (e){
            rej(e);
        }

        request.on("data", (chunk)=>{
            try {
                protoParser.push(chunk);
            } catch (e){
                rej(e);
            }

        });

        request.on("error", rej);

        request.on("end", ()=>{
            request.bodyUsed = true;
            res(protoParser.value());
        });
    });
}

/** Body Parser
 * 
 * @param {IncomingMessage|Request} request 
 * @param {BodyParserOptions} opts 
 * @returns {Promise<BodyData>}
 */
export default function BodyParser(request:IncomingMessage|Request, opts:BodyParserOptions = {}):Promise<BodyData>{
    if(isCloudflareRequest(request))
        return processCloudflareRequest(request, opts);
    
    return processNodeRequest(request, opts);
}