/** /Validation/Date
 * 
 * @author Alex Malotky
 */
import { TypeValidator } from "./Type";
import { defaultFormatGenerator } from "./Util";
import Date, { formatDate } from "./Type/Date";

// Date Format Name
export const DateName = "Date";

/** Date Validator
 * 
 */
export default class DateValidator extends TypeValidator<Date> {
    constructor(value?:Date){
        if(value){
            try {
                value = formatDate(value)
            } catch (e){
                throw new TypeError(`${value} is not a valid Date!`);
            }
        }
        
        super(DateName, defaultFormatGenerator(formatDate, value));
    }
}