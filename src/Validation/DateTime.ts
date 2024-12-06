/** /Validation/DateTime
 * 
 * @author Alex Malotky
 */
import { TypeValidator } from "./Type";
import { defaultFormatGenerator } from "./Util";
import DateTime, { formatDateTime } from "./Type/DateTime";

// DateTime Format Name
export const DateTimeName = "DateTime";

/** DateTime Type Validator
 * 
 */
export default class DateTimeValidator extends TypeValidator<DateTime> {
    constructor(value?:DateTime){
        if(value){
            try {
                value = formatDateTime(value)
            } catch (e){
                throw new TypeError(`${value} is not a valid DateTime!`);
            }
        }
        super(DateTimeName, defaultFormatGenerator(formatDateTime, value));
    }
}

