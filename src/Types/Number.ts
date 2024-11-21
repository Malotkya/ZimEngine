/** /Types/Number
 * 
 * @author Alex Malotky
 */
import { emptyHandler, TypeClass, format } from "./Util";

type Number = number;
export default Number;

//Number Format Name
export const NumberName = "number";

/** Number Type Class
 * 
 */
export class NumberType extends TypeClass<Number> {
    constructor(value?:Number){
        super(NumberName, formatNumberGenerator(value));
    }
}

function formatNumberGenerator(ifEmpty?:Number):format<Number> {
    return function formatNumber(value:unknown){
        const number = Number(emptyHandler(value, NumberName, ifEmpty));
    
        if(isNaN(number))
            throw new TypeError(`Invalid number '${value}'!`);
    
        return number
    }
}

