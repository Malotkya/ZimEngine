import { ServerResponse } from "node:http";
import {HeadersInit} from "../Util";

export type ResponseInit = [string, {status:number, headers:HeadersInit}, string|undefined];

export default class OutgoingResponse {
    _server:ServerResponse|undefined;
    _status:number|undefined;
    _headers:HeadersInit;
    _body:string;
    _redirect:string|undefined;
    
    constructor(response?:ServerResponse) {
        this._server = response;
        this._headers = new Map();
        this._body = "";
    }

    getHeader(name:string):string|undefined {
        if(this._server) {
            let temp = this._server.getHeader(name);
            if(temp)
                return String(temp);
        }

        return this._headers.get(name);
    }

    setHeader(name:string, value:string){
        if(this._server){
            this._server.setHeader(name, value);
        } else {
            this._headers.set(name, value);
        }
    }

    get status():number {
        if(this._server)
            return this._server.statusCode;

        return this._status || 200;
    }

    set status(value:number){
        if(typeof value !== "number")
            throw new TypeError("Status must be a number!");

        if(this._server) {
            this._server.statusCode = value;
        } else {
            this._status = value;
        }
    }

    write(chunk:string){
        if(this._server){
            this._server.write(chunk)
        } else {
            this._body += chunk;
        }
    }

    redirect(url: string): void {
        if(this._server){
            this._server.writeHead(302, {Location: url});
        }

        this._redirect = url;
    }

    get redirected():boolean {
        return this._redirect !== undefined;
    }

    /** Was Nothing Sent
     * 
     * @returns {boolean}
     */
    get headersSent():boolean {
        if(this._server)
            return this._server.headersSent

        return typeof this._status === "number"
    }

    end():ResponseInit{
        if(this._server){
            this._server.end();
        }

        return [
            this._body,
            {
                status: this._status || 500,
                headers: this._headers
            },
            this._redirect
        ]
    }
}

