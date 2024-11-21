/** /Types/Empty
 * 
 * @author Alex Malotky
 */
import { TypeClass, isEmpty as test } from "./Util";

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

export function isEmpty(value:unknown):value is Empty {
    return test(value);
}
