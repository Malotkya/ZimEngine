/** /Types/Boolean
 * 
 * @author Alex Malotky
 */
import { TypeClass, format } from ".";
import { emptyHandler } from "./Empty";

type Boolean = boolean;
export default Boolean;

//Boolean Format Name
export const BooleanName = "boolean";

/** Boolean Type Class
 * 
 */
export class BooleanType extends TypeClass<Boolean> {
    constructor(value?:Boolean){
        super(BooleanName, formatBooleanGenerator(value));
    }
}

function formatBooleanGenerator(ifEmpty?:boolean):format<Boolean> {

    return function formatBoolean(value:unknown):Boolean {
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

