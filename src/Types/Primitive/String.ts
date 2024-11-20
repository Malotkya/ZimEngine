/** /Types/Primitive/String
 * 
 * @author Alex Malotky
 */
import { Validator } from "..";

//Number Format Name
export  type StringType = "string";
export const StringName = "string";

/** String Validator
 * 
 */
export class StringValidator extends Validator<string> {
    constructor(value:unknown){
        super(StringName, String(value))
    }
}