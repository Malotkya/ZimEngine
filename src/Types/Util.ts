/** /Types/Util
 * 
 * 
 */

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

/** is Empty
 * 
 * @param {value} value 
 * @returns {boolean}
 */
export function isEmpty(value:unknown):boolean {
    return value === null || value === undefined;
}

/** Handle Empty Type
 * 
 * @param {unknown} value 
 * @param {string} name
 * @param {any} ifEmpty 
 * @returns {unknown}
 */
export function emptyHandler(value:unknown, name:string, ifEmpty?:any):unknown {
    if(isEmpty(value)){
        if(isEmpty(ifEmpty))
            throw new EmptyError(`Expected ${name} Value!`)

        return ifEmpty;
    }

    return value;
}

export class EmptyError extends Error {};