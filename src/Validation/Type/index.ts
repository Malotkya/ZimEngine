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
export type Optional<T> = T|Empty;

export type Simple = string|boolean|number|null;
export type {Color, Date, DateTime, Email, Telephone, Time, Url, Empty};

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

    run(value:unknown):T {
        try {
            return this._format(value);
        } catch (e:any){
            throw new ValidationError(this._name, e.message || String(e))
        }
    }

    simplify(value:T):Simple {
        //@ts-ignore
        return value;
    };
}

export class ValidationError extends Error {
    constructor(name:string, message:string){
        super(`${name} Validation Error: ${message}`);
    }
}