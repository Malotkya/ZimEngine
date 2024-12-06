/** /Validation/Boolean
 * 
 * @author Alex Malotky
 */
import { TypeValidator, format } from "./Type";
import { EmptyError } from "./Type/Empty";

//Boolean Format Name
export const BooleanName = "boolean";

/** Boolean Validator
 * 
 */
export default class BooleanValidator extends TypeValidator<boolean> {
    constructor(value?:boolean){
        if(value)
            value = convertToBoolean(value);
        super(BooleanName, formatBooleanGenerator(value));
    }
}

/** FOrmat Boolean Genderator
 * 
 * @param {boolean} ifEmpty 
 * @returns {Function}
 */
function formatBooleanGenerator(ifEmpty?:boolean):format<boolean> {

    /** Format Boolean
     * 
     * @param {unkown} value
     * @return {boolean}
     */
    return function formatBoolean(value:unknown):boolean {

        if(value === undefined) {
            if(ifEmpty === undefined)
                throw new EmptyError();

            return ifEmpty;
        } else if(value == null){
            return ifEmpty || false;
        } else {
            return convertToBoolean(value);
        }
    }
}

/** Convert To Boolean
 * 
 * @param {unknown} value 
 * @returns {boolean}
 */
function convertToBoolean(value:unknown):boolean {
    switch (typeof value){
        case "string":
            return value.toLocaleLowerCase() === "true" || value === "1";

        case "bigint":
            value = Number(value);
        case "number":
            return value === 1;

        case "boolean":
            return value;

        case "object":
            if(value === null) {
                return false;
            }
        
        default:
            throw new TypeError(`Invalid type '${typeof value}' for Boolean!`);
    }
}

