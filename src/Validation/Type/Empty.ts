/** /Validation/Types/Empty
 * 
 * @author Alex Malotky
 */
import {format} from "./";

//Empty Type
type Empty = null|undefined;
export default Empty;

 /** Format Color
 * 
 * @param value 
 */
export function formatEmpty(value:unknown):Empty {
    if(isEmpty(value) === false)
        throw new TypeError(`${value} is not empty!`);
        
    return null;
}

/** is Empty
 * 
 * @param {value} value 
 * @param {boolean} string
 * @returns {boolean}
 */
export function isEmpty(value:unknown, string:boolean = false):value is Empty {
    if(string && typeof value === "string"){
        return value === "";
    }
    
    return value === null || value === undefined;
}

/** Handle Empty Type
 * 
 * @param {unknown} value 
 * @param {string} name
 * @param {any} ifEmpty 
 * @returns {unknown}
 */
export function emptyHandler<T>(value:unknown, format:format<T>, ifEmpty?:T):T {
    if(isEmpty(value, true)){
        if(ifEmpty === undefined)
            throw new EmptyError()

        return ifEmpty;
    }

    return format(value);
}

export class EmptyError extends Error {
    constructor(){
        super("Unexpected Empty Value!")
    }
};