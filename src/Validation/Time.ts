/** /Validation/Time
 * 
 * @author Alex Malotky
 */
import { TypeValidator } from "./Type";
import { defaultFormatGenerator } from "./Util";
import Time, {formatTime} from "./Type/Time"

//Time Format Name
export const TimeName = "Time";

/** Time Validator
 * 
 */
export default class TimeValidator extends TypeValidator<Time> {
    constructor(value?:Time){
        if(value){
            try {
                value = formatTime(value)
            } catch (e){
                throw new TypeError(`${value} is not a valid Time!`);
            }
        }
        
        super(TimeName, defaultFormatGenerator(formatTime, value))
    }
}


