/** /Validation/Number
 * 
 * @author Alex Malotky
 */
import { TypeValidator, format } from "./Type";
import { emptyHandler } from "./Type/Empty";

//Number Format Name
export const NumberName = "number";

/** Number Validator
 * 
 */
export default class NumberValidator extends TypeValidator<number> {
    constructor(value?:number){
        if(value)
            value = convertToNumber(value);

        super(NumberName, formatNumberGenerator(value));
    }
}

/** Format Number Generator
 * 
 * @param {number} ifEmpty 
 * @returns {Function}
 */
function formatNumberGenerator(ifEmpty?:number):format<number> {

    /** Format Number
     * 
     * @param {unknown} value
     * @returns {number}
     */
    return function formatNumber(value:unknown):number{
        return emptyHandler(value, convertToNumber, ifEmpty);
    }
}

/** Convert To Number;
 * 
 * @param {unknown} value 
 * @returns {number}
 */
function convertToNumber(value:unknown):number {
    const number = Number(value);
    
    if(isNaN(number))
        throw new TypeError(`Invalid number '${value}'!`);

    return number
}
