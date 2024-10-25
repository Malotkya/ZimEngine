/** Engine/Context/ProtoResponse
 * 
 */
import { ServerResponse } from "node:http";
import {Transform, TransformCallback} from "node:stream";
import { sleep } from "../Util";

export type {ServerResponse as NodeResponse}

export default class OutgoingResponse extends Transform{
    //Strict private members
    #server:ServerResponse|undefined;
    #status:number;
    #headers:Map<string, string>;
    #body: Array<Uint8Array>;
    #redirect: URL|undefined;

    //Not Strict
    private working:boolean|undefined;
    private static encoder = new TextEncoder();

    /** Stringify Encoded Data
     * 
     * @param {any} data 
     * @param {string} encode 
     * @returns {string}
     */
    private static _stringify(data:any, encode:string):string {

        //Test if not string.
        if(typeof data !== "string") {

            //Test if it has toString method
            if(typeof data.toString === "function") {

                //Test if accepts encdoding.
                if(data.toString.length >= 1){
                    return data.toString(encode);
                } else {
                    if(encode)
                        console.warn(`Encoding '${encode}' ignored!`);
                    return data.toString();
                }
            }

            return String(data);
        }
        
        return data;
    }
    
    /** Text Encoder
     * 
     * @param {any} data 
     * @param {string} encode 
     * @returns {Uint8Array}
     */
    private static _text(data:any, encode:string):Uint8Array {
        return OutgoingResponse.encoder.encode(OutgoingResponse._stringify(data, encode));
    }

    /** Proto Response Constructor
     * 
     */
    constructor(response?:ServerResponse){
        super();

        this.#status = 200;
        this.#headers = new Map();
        this.#body = [];
        this.#server = response;

        //Default headers
        this.#headers.set("Referrer-Policy", "strict-origin");
    }

    /** Transform Data Override
     * 
     * @param {any} data 
     * @param {string} encode 
     * @param {Function} callback 
     */
    _transform(data:any, encode:string, callback:TransformCallback){
        this.working = true;
        if( data instanceof Uint8Array )
            this.#body.push(data);
        else
            this.#body.push(OutgoingResponse._text(data, encode));
        callback();
    }

    /** Flush Override
     * 
     * @param callback 
     */
    _flush(callback: TransformCallback): void {
        this.working = false;
        callback()
    }

    /** Has Commited
     * 
     * @returns 
     */
    commited():boolean{
        return this.working !== undefined
    }

    /** Status Getter
     * 
     */
    get status():number {
        return this.#status;
    }

    /** Status Setter
     * 
     */
    set status(value:number){
        this.#status = value;
    }

    /** Headers Getter
     * 
     */
    get headers():Map<string, string>{
        return this.#headers;
    }

    /** Flush Response
     * 
     * @returns {Promise<Response>}
     */
    async flush():Promise<Response|undefined> {
        while(this.working)
            sleep();

        if(this.#server){
            if(this.#redirect){
                this.#server.writeHead(this.#status, JSON.stringify({Location: this.#redirect}));
            } else {
                this.#server.statusCode = this.#status;
                for(const [key, value] of this.#headers.entries()){
                    this.#server.setHeader(key, value);
                }
                for(const chunk of this.#body)
                    this.#server.write(chunk);

                this.#server.end();
            }
            
            return undefined;
        }

        if( this.#redirect && (this.#status > 300 && this.#status < 400) ){
            return Response.redirect(this.#redirect, this.#status);
        }

        const headers:Record<string, string> = {};
        for(const [name, value] of this.#headers.entries())
            headers[name] = value;

        return new Response(new Blob(this.#body), {
            status: this.status,
            headers: headers
        });
    }

    /** Redirect Resposne
     * 
     * @param {URL} url 
     * @param {number} status 
     */
    redirect(url:URL, status:number = 302){
        this.#redirect = url;
        this.#status = status;
        this.working = false;
    }
}