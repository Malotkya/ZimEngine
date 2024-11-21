import Boolean from "./Boolean";
import Color from "./Color";
import Date from "./Date";
import DateTime from "./DateTime";
import Email from "./Email";
import Empty from "./Empty";
import File from "./File";
import List from "./List";
import Number from "./Number";
import Object from "./Object";
import String from "./String";
import Telephone from "./Telephone";
import Time from "./Time";
import Url from "./Url";

type Type = Boolean|Color|Date|DateTime|Email|Empty|File|Number|Object|String|Telephone|Time|Url|List<any>;
export default Type;

type format<T> = (value:unknown)=>T;

/** Type Abstract Class
 * 
 */
export abstract class TypeClass<T> {
    private _name:string;
    private _format:format<T>;
    readonly _type:T = null as any;

    constructor(name:string, format:format<T>) {
        this._name = name;
        this._format = format;
    }

    get name():string {
        return this._name;
    }

    get format():format<T> {
        return this._format;
    }
}