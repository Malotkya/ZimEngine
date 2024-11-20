/** /Types/Complex/Date
 * 
 * @author Alex Malotky
 */

const DATE_REGEX = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

/** Date Type
 * 
 */
type Date = string;
export default Date;

/** Date Format Type
 * 
 */
export type DateType = "Date";

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

/** Validate Date
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

