/** /Context/OutgoingResponse
 * 
 * @author Alex Malotky
 */
import { ServerResponse } from "node:http";
import {Transform, TransformCallback} from "node:stream";
import { sleep } from "../Util";

const DEFAULT_ENCODER = new TextEncoder();

//Node:Resposne Type
type NodeResponse = ServerResponse;
export type {NodeResponse}

/** Stringify Encoded Data
 * 
 * Will apply encoding toString if able before using default
 * String() method.
 * 
 * @param {any} data 
 * @param {string} encode 
 * @returns {string}
 */
function stringify(data:any, encode:string):string {
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

/** Outgoing Response
 * 
 * Wrapper around the Node:Response or 
 * returns the Cloudflare:Response
 */
export default class OutgoingResponse extends Transform{
    //Strict Private
    #server:ServerResponse|undefined;
    #status:number;
    #headers:Map<string, string>;
    #body: Array<Uint8Array>;
    #redirect: URL|undefined;

    //Not Strict Private
    private working:boolean|undefined;
    private encoder:TextEncoder;

    /** Proto Response Constructor
     * 
     */
    constructor(response?:ServerResponse, encoder:TextEncoder = DEFAULT_ENCODER){
        super();

        this.#status = 200;
        this.#headers = new Map();
        this.#body = [];
        this.#server = response;
        this.encoder = encoder;

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
            this.#body.push(this.encoder.encode(stringify(data, encode)));
        callback();
    }

    /** Flush Override
     * 
     * @param callback 
     */
    _flush(callback: TransformCallback): void {
        this.working = false;
        this.emit("close");
        callback()
    }

    /** Has Commited
     * 
     * @returns {boolean}
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
            await sleep();

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
            }

            this.#server.end();
            return;
        }

        if( this.#redirect ){
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