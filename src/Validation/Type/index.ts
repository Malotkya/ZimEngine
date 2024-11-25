/** /Validation/Type
 * 
 * @author Alex Malotky
 */
import Color from "./Color";
import Date from "./Date";
import DateTime from "./DateTime";
import Email from "./Email";
import File from "./File";
import Telephone from "./Telephone";
import Time from "./Time";
import Url from "./Url";
import Empty from "./Empty";

//Complex Types
export type List<T extends Type> = T[];
export type Object<K extends string|number|symbol> = { [key in K]:Type }
export type Optional<T extends Type> = T|null;
export {Color, Date, DateTime, Email, Telephone, Time, Url, Empty};

export type Simple = string|boolean|number|null;

//Default Types
type Type = boolean|number|string|Color|Date|DateTime|Email|Empty|File|Telephone|Time|Url|List<any>|Object<any>
export default Type;

/** Format Type
 * 
 */
export type format<T> = (value:unknown)=>T;

/** Type Validator Abstract Class
 * 
 */
export abstract class TypeValidator<T> {
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

    get run():format<T> {
        return this._format;
    }

    simplify(value:T):Simple {
        //@ts-ignore
        return value;
    };
}