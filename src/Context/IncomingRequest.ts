import { IncomingMessage } from "node:http"
import BodyParser, {Body, FileData} from "../BodyParser"
import {Data, HeadersInit} from "../Util";

export interface RequestType {
    method: string,
    url:string,
    headers:Data<string|undefined>
    formData():Promise<Data<string|FileData>>,
}



export default class IncomingRequest implements RequestType {
    private _message:IncomingMessage;
    private _data:Body|undefined;
    private _headers:Map<string, string>;

    constructor(message: IncomingMessage) {
        this._message = message;

        this._headers = new Map();
        for(let name in message.headers){
            this._headers.set(name, String(message.headers[name]))
        }
    }

    get method():string {
        return this._message.method || "unknown";
    }

    get url():string {
        return this._message.url || "undefined";
    }

    get headers():HeadersInit {
        return this._headers;
    }

    async formData(): Promise<Data<string|FileData>> {
        if(this._data === undefined)
            this._data = await BodyParser(this._message);
        return this._data;
    }
}