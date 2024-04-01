import { Transform, TransformCallback } from "stream";
import fs, { WriteStream } from "fs";

export type Body = Map<string, string>;

export class BodyParser extends Transform {
    _buffer:string;
    _debug:WriteStream;

    constructor(){
        super();
        this._buffer = "";
        this._debug = fs.createWriteStream("body.txt");
    }

    _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
        this._buffer += Buffer.from(chunk, encoding).toString();
        this._debug.write(chunk);
        callback();
    }

    _flush(callback: TransformCallback): void {
        this._debug.close();
        callback();
    }

    getBody():Body {
        const body:Body = new Map();
        for(let line of this._buffer.split("&")){
            const [name, value] = line.split("=");
            body.set(name, value);
        }
        return body;
    }
}