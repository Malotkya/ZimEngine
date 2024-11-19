/** /Context/IncomingRequest
 * 
 * @author Alex Malotky
 */
import { IncomingMessage } from "node:http"
import { isCloudflareRequest } from "../Util";

// Node:Request Type
type NodeRequeset = IncomingMessage;
export type {NodeRequeset};

/** Headers Class
 * 
 * Additional Wrapper around Map<string, string>
 * for the key to not be case sensitive.
 */
class Headers extends Map<string, string> {
    set(key:string, value:string){
        return super.set(key.toLocaleLowerCase(), value);
    }

    get(key:string){
        return super.get(key.toLocaleLowerCase());
    }
}

/** Incoming Request
 * 
 * Wrapper around the Node:Request or Cloudflare:Request
 */
export default class IncomingRequest {
    private _headers:Headers;
    private _url:string;
    private _method:string;

    constructor(message: NodeRequeset|Request) {
        this._headers = new Headers();
        this._url = message.url!;
        this._method = message.method!.toUpperCase();

        if( isCloudflareRequest(message) ){
            message.headers.forEach((value, key)=>{
                this._headers.set(key, value);
            });
        } else {
            for(const key in message.headers) {
                let value = message.headers[key]!;
                if(Array.isArray(value))
                    value = value.join(" ");
                this._headers.set(key, value);
            }
        }
    }

    /** Method Getter
     * 
     */
    get method():string {
        return this._method;
    }

    /** URL String Getter
     * 
     */
    get url():string {
        return this._url;
    }

    /** Headers Getter
     * 
     */
    get headers() {
        return this._headers;
    }
}