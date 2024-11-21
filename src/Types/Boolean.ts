/** /Types/Primitive/Boolean
 * 
 * @author Alex Malotky
 */
import { TypeClass } from ".";

type Boolean = boolean;
export default Boolean;

//Boolean Format Name
export const BooleanName = "boolean";

/** Boolean Type Class
 * 
 */
export class BooleanType extends TypeClass<Boolean> {
    constructor(){
        super(BooleanName, getBoolean);
    }
}

function getBoolean(value:unknown):boolean {
    switch (typeof value){
        case "string":
            return value.toLocaleLowerCase() === "true"

        case "bigint":
            value = Number(value);
        case "number":
            return value === 1;

        case "boolean":
            return value;

        default:
            return false;
    }
}