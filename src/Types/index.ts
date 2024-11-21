/** /Types
 * 
 * @author Alex Malotky
 */
import Boolean, { BooleanName } from "./Boolean";
import Color, { ColorName } from "./Color";
import Date, { DateName } from "./Date";
import DateTime, { DateTimeName } from "./DateTime";
import Email, { EmailName } from "./Email";
import File, { FileName } from "./File";
import Number, { NumberName } from "./Number";
import String, { StringName } from "./String";
import Telephone, { TelephoneName } from "./Telephone";
import Time, { TimeName } from "./Time";
import Url, { UrlName } from "./Url";
import Object from "./Object";
import List from "./List";
import Empty, {emptyHandler} from "./Empty";

type Type = Boolean|Color|Date|DateTime|Email|Empty|File|Number|Object|String|Telephone|Time|Url|List<any>;
export default Type;

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

/** Format Type
 * 
 */
export type format<T> = (value:unknown)=>T;

/** Format With Default Value Generator
 * 
 */
export function defaultFormatGenerator<T>(fun:format<T>, name:string, defaultValue?:T):format<T> {
    return function defaultFormater(value:unknown):T{
        return fun(emptyHandler(value, name, defaultValue));
    };
}

/** Basic Names Helper Array
 * 
 * Hopefully Am able to use this later
 */
export const BASIC_NAMES = [
    BooleanName, NumberName, StringName,
    ColorName, DateTimeName, DateName, EmailName, FileName,  TelephoneName, TimeName, UrlName
] as const;

//Name Types
export type BasicNames = typeof BASIC_NAMES[number]
export type TypeNames  = BasicNames | Dictionary<BasicNames> | Array<BasicNames>;