/** /Types/Empty
 * 
 * @author Alex Malotky
 */
import { Validator } from ".";

//Empty Type
type Empty = null|undefined;
export default Empty;

//Empty Format Name
export  type EmptyType = "Empty";
export const EmptyName = "Empty";

/** Empty Validator
 * 
 */
export class EmptyValidator extends Validator<Empty> {
    constructor(value:unknown) {
        if(isEmpty(value) === false)
            throw new TypeError(`${value} is not empty!`);

        super(EmptyName, null);
    }
}

/** is Empty
 * 
 * @param {value} value 
 * @returns {boolean}
 */
export function isEmpty(value:unknown):value is Empty {
    return value === null || value === undefined;
}