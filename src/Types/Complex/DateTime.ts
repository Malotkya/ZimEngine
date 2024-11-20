/** /Types/Complex/DateTime
 * 
 * @author Alex Malotky
 */
import { Validator } from "..";

const DATE_TIME_REGEX = /^(\d{4})-(\d{1,2})-(\d{1,2})[Tt](\d{1,2}):(\d{1,2})$/

// DateTime Type
type DateTime = string;
export default DateTime;

// DateTime Format Name
export type  DateTimeType = "DateTime";
export const DateTimeName = "DateTime";

/** DateTime Validator
 * 
 */
export class DateTimeValidator extends Validator<DateTime> {
    constructor(value:unknown){
        super(DateTimeName, formatDateTime(value));
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

