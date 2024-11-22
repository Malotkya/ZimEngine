/** /Validation/Boolean
 * 
 * @author Alex Malotky
 */
import { TypeValidator, format } from "./Type";
import { emptyHandler } from "./Type/Empty";

//Boolean Format Name
export const BooleanName = "boolean";

/** Boolean Validator
 * 
 */
export default class BooleanValidator extends TypeValidator<boolean> {
    constructor(value?:boolean){
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
        value = emptyHandler(value, BooleanName, ifEmpty);

        switch (typeof value){
            case "string":
                return value.toLocaleLowerCase() === "true"
    
            case "bigint":
                value = Number(value);
            case "number":
                return value === 1;
    
            case "boolean":
                return value;

            case "undefined":
                return false;
    
            case "object":
                if(value === null) {
                    return false;
                }
            
            default:
                throw new TypeError(`Invalid type '${typeof value}' for Boolean!`);
        }
    }
}

