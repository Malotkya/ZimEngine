/** /Types/Primitive/Number
 * 
 * @author Alex Malotky
 */
import { TypeClass } from ".";

type Number = number;
export default Number;

//Number Format Name
export const NumberName = "number";

/** Number Type Class
 * 
 */
export class NumberType extends TypeClass<Number> {
    constructor(){
        super(NumberName, getNumber);
    }
}

function getNumber(value:unknown){
    const number = Number(value);

    if(isNaN(number))
        throw new TypeError(`Invalid number '${value}'!`);

    return number
}