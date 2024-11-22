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
        super(DateTimeName, defaultFormatGenerator(formatDateTime, DateTimeName, value));
    }
}

