/** /Types/Primitive/Number
 * 
 * @author Alex Malotky
 */
import { Validator } from "..";

//Number Format Name
export  type NumberType = "number";
export const NumberName = "number";

/** Number Validator
 * 
 */
export class NumberValidator extends Validator<number> {
    constructor(value: unknown){
        const number = Number(value);
        if(isNaN(number))
            throw new TypeError(`Invalid number '${value}'!`);

        super(NumberName, number);
    }
}