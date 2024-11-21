/** /Types/Primitive/String
 * 
 * @author Alex Malotky
 */
import { TypeClass } from ".";

type String = string;
export default String;

//Number Format Name
export const StringName = "string";

/** String Type Class
 * 
 */
export class StringType extends TypeClass<String> {
    constructor(){
        super(StringName, String)
    }
}