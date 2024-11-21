/** /Types/Empty
 * 
 * @author Alex Malotky
 */
import { TypeClass } from ".";

//Empty Type
type Empty = null|undefined;
export default Empty;

//Empty Format Name
export const EmptyName = "Empty";

/** Empty Type Class
 * 
 */
export class EmptyType extends TypeClass<Empty> {
    constructor() {
        super(EmptyName, getEmpty);
    }

    get value(){
        return null;
    }
}

function getEmpty(value:unknown):Empty {
    if(isEmpty(value) === false)
        throw new TypeError(`${value} is not empty!`);

    return null;
}

/** is Empty
 * 
 * @param {value} value 
 * @returns {boolean}
 */
export function isEmpty(value:unknown):value is Empty {
    return value === null || value === undefined;
}