/** /Validation/Types/Email
 * 
 * @author Alex Malotky
 */
//Source: https://emailregex.com/
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

// Email Type
type Email = string;
export default Email;

/** Format Email
 * 
 * Used to format / sanitize email input.
 * 
 * @param {unknown} value 
 * @returns {Email}
 */
export function formatEmail(value:unknown):Email {
    if(typeof value !== "string")
        throw new TypeError("Email must be stored in a string!");

    const format = value.toLocaleLowerCase();
    if(format.match(EMAIL_REGEX) === null)
        throw new TypeError("Email is not formated correctly!")

    return format;
}

/** Is Email
 * 
 * @param {unknown} value 
 * @returns {boolean}
 */
export function isEmail(value:unknown):value is Email {
    try {
        formatEmail(value)
    } catch (e){
        return false;
    }

    return true;
}