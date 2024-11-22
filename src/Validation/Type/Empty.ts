/** /Validation/Types/Empty
 * 
 * @author Alex Malotky
 */

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
export function isEmpty(value:unknown, string:boolean = false):boolean {
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
export function emptyHandler(value:unknown, name:string, ifEmpty?:any):unknown {
    if(isEmpty(value)){
        if(isEmpty(ifEmpty))
            throw new EmptyError(`Expected ${name} Value!`)

        return ifEmpty;
    }

    return value;
}

export class EmptyError extends Error {};