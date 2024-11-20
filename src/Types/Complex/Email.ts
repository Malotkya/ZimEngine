/** /Types/Complex/Email
 * 
 * @author Alex Malotky
 */

//Source: https://emailregex.com/
const EMAIL_REGEX = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/

/** Email Type
 * 
 */
type Email = string;
export default Email;

/** Email Format Type
 * 
 */
export type EmailType = "Email";

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

/** Validate Email
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