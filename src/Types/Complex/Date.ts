/** /Types/Complex/Date
 * 
 * @author Alex Malotky
 */
import { Validator } from "..";

const DATE_REGEX = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

// Date Type
type Date = string;
export default Date;

// Date Format Name
export  type DateType = "Date";
export const DateName = "Date";

/** Date Validator
 * 
 */
export class DateValidator extends Validator<Date> {
    constructor(value:unknown){
        super(DateName, formatDate(value));
    }
}

/** Format Date
 * 
 * Used to format / sanitize email input.
 * 
 * @param {unknown} value 
 * @returns {Date}
 */
export function formatDate(value:unknown):Date {
    if(typeof value !== "string")
        throw new TypeError("Date must be stored in a string!");

    if(value.match(DATE_REGEX) === null)
        throw new TypeError("Date is not formated correctly!");

    return value;
}

/** Is Date
 * 
 * @param {unknwon} value 
 * @returns {boolean}
 */
export function isDate(value:unknown):value is Date {
    try {
        formatDate(value)
    } catch (e){
        return false;
    }

    return true;
}

