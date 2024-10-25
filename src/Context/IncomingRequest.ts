import { IncomingMessage } from "node:http"
import { isCloudflareRequest } from "../Util";

export type {IncomingMessage as NodeRequeset};

export default class IncomingRequest {
    private _headers:Map<string, string>;
    private _url:string;
    private _method:string;

    constructor(message: IncomingMessage|Request) {
        this._headers = new Map();
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

    get method():string {
        return this._method;
    }

    get url():string {
        return this._url;
    }

    get headers() {
        return this._headers;
    }
}