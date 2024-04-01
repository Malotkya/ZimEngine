
/** /BodyParser
 * 
 * @author Alex Malotky
 */
import { Transform, TransformCallback } from "stream";
import { IncomingHttpHeaders } from "http";
import fs from "fs";
import path from "path";

/** File Data Interface
 * 
 */
export interface FileData {
    fileName:string,
    tempFile:string,
    contentType:string,
}

/** Body Type
 * 
 */
export type Body = Map<string, string|FileData>;

/** Body Parser
 * 
 */
export class BodyParser extends Transform {
    _buffer:string;
    _boundry:RegExp;
    _multipart:boolean;
    _data:Body;
    _directory:string;

    /** Constructor
     * 
     * @param {IncomingHttpHeaders} headers 
     * @param {any} opts 
     */
    constructor(headers:IncomingHttpHeaders, opts:any={dir:"uploads"}){
        super();
        const type = headers["content-type"];
        if(type && type.indexOf("multipart/form-data") >= 0) {
            this._multipart = true;
            const match = type.match(/\d+$/);
            if(match === null)
                throw new Error("Header is malformed.");
            this._boundry = new RegExp("-+"+match[0]);
            
        } else {
            this._multipart = false;
            this._boundry = new RegExp("&");
        }
        this._buffer = "";
        this._data = new Map();
        this._directory = opts.dir;

        fs.mkdirSync(this._directory, {recursive: true});
    }

    /** Process Buffer
     * 
     * Loops through the buffer untill all boundrys are crossed.
     */
    processBuffer(){
        let match = this._buffer.match(this._boundry);

        while(match !== null){
            const index = this._buffer.indexOf(match[0]);

            if(index === 0){
                this._buffer = this._buffer.substring(match[0].length);
            } else {
                this.processData(this._buffer.slice(0, index));
                this._buffer = this._buffer.slice(index+match[0].length)
            }

            match = this._buffer.match(this._boundry);
        }
    }

    /** Takes data as a string and process the information.
     * 
     * @param {string} data 
     */
    processData(data:string){
        if(this._multipart){
            const {name, info} = this.processMultipartData(data);
            this._data.set(name, info);
        } else {
            const [name, value] = data.split("=");
            this._data.set(name, value);
        }
    }

    /** Process Multipart Data 
     * 
     * @param {string} data 
     * @returns {name:string, info:FileData|string}
     */
    processMultipartData(data:string):{name:string, info:FileData|string}{
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
            return {
                name: headers["name"],
                info: data
            }
        }
    
        //Get additional file info and save.
        const tempFile = path.join(this._directory, String(Date.now()));
        const contentType = headers["Content-Type"];
        const fileName = headers["filename"];
    
        fs.writeFileSync(tempFile, data);
        return {
            name: headers["name"],
            info: {tempFile, contentType, fileName}
        }
    }

    /** _transform Override
     * 
     * @param {any} chunk 
     * @param {BufferEncoding} encoding 
     * @param {TransformCallback} callback 
     */
    _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
        this._buffer += Buffer.from(chunk, encoding).toString();
        this.processBuffer();
        callback();
    }

    /** _flush Override
     * 
     * @param {TransformCallback} callback 
     */
    _flush(callback: TransformCallback): void {
        this.emit("end");
        callback();
    }

    /** Body Getter
     * 
     */
    get body():Body {
        return this._data;
    }
}