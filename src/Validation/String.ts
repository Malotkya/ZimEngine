/** /Validation/String
 * 
 * @author Alex Malotky
 */
import { TypeValidator, format } from "./Type";
import { emptyHandler } from "./Type/Empty";

//Number Format Name
export const StringName = "string";

/** String Validator
 * 
 */
export default class StringValidator extends TypeValidator<string> {
    constructor(value?:string){
        super(StringName, formatStringGenerator(value))
    }
}
/** Format String Generator
 * 
 * @param {string} ifEmpty 
 * @returns {Function}
 */
function formatStringGenerator(ifEmpty?:string):format<string> {

    /** Format String
     * 
     * @param {unknown} value
     * @return {string}
     */
    return function formatString(value:unknown):string {
        value = emptyHandler(value, StringName, ifEmpty);

        switch(typeof value){
            case "object":
                return JSON.stringify(value);

            case "string":
                return value;

            default:
                return String(value);
        }
    }
}