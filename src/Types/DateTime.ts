/** /Types/Complex/DateTime
 * 
 * @author Alex Malotky
 */
import { TypeClass } from ".";

const DATE_TIME_REGEX = /^(\d{4})-(\d{1,2})-(\d{1,2})[Tt](\d{1,2}):(\d{1,2})$/

// DateTime Type
type DateTime = string;
export default DateTime;

// DateTime Format Name
export const DateTimeName = "DateTime";

/** DateTime Type Class
 * 
 */
export class DateTimeType extends TypeClass<DateTime> {
    constructor(){
        super(DateTimeName, formatDateTime);
    }
}

/** Format DateTime
 * 
 * Used to format / sanitize email input.
 * 
 * @param {unknown} value 
 * @returns {DateTime}
 */
export function formatDateTime(value:unknown):DateTime {
    if(typeof value !== "string")
        throw new TypeError("DateTime must be stored in a string!");

    if(value.match(DATE_TIME_REGEX) === null)
        throw new TypeError("DateTime is not formated correctly!");

    return value;
}

/** Is DateTime
 * 
 * @param {unknwon} value 
 * @returns {boolean}
 */
export function isDateTime(value:unknown):value is DateTime {
    try {
        formatDateTime(value)
    } catch (e){
        return false;
    }

    return true;
}

