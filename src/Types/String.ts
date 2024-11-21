/** /Types/String
 * 
 * @author Alex Malotky
 */
import { emptyHandler, TypeClass, format } from "./Util";

type String = string;
export default String;

//Number Format Name
export const StringName = "string";

/** String Type Class
 * 
 */
export class StringType extends TypeClass<String> {
    constructor(value?:String){
        super(StringName, formatStringGenerator(value))
    }
}

function formatStringGenerator(ifEmpty?:String):format<String> {

    return function formatString(value:unknown):String {
        return String(emptyHandler(value, StringName, ifEmpty))
    }
}