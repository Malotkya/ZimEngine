/** /Types/Primitive/Boolean
 * 
 * @author Alex Malotky
 */
import { Validator } from "..";

//Boolean Format Name
export  type BooleanType = "boolean";
export const BooleanName = "boolean";

/** Boolean Validator
 * 
 */
export class BooleanValidator extends Validator<boolean> {
    constructor(value: unknown){
        let bool:boolean;
        switch (typeof value){
            case "symbol":
                value = value.toString();
            case "string":
                //@ts-ignore
                bool = value.toLocaleLowerCase() === "true";
                break;

            case "bigint":
                value = Number(value);
            case "number":
                bool = value === 1;
                break;

            case "boolean":
                bool = value;
                break;

            default:
                bool = false;
        }
        super(BooleanName, bool);
    }
}