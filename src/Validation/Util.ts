/** /Types/Util
 * 
 * @author Alex Malotky
 */
import { format } from "./Type";
import { emptyHandler } from "./Type/Empty";

/** Format With Default Value Generator
 * 
 */
export function defaultFormatGenerator<T>(fun:format<T>, name:string, defaultValue?:T):format<T> {
    return function defaultFormater(value:unknown):T{
        return fun(emptyHandler(value, name, defaultValue));
    };
}



