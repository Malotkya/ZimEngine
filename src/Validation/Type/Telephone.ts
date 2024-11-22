/** /Validation/Types/Telephone
 * 
 * @author Alex Malotky
 */
//Source: https://stackoverflow.com/questions/16699007/regular-expression-to-match-standard-10-digit-phone-number
const TELEPHONE_REGEX = /^(\+?\d{1,2})?\s?[(.]?(\d{3})\)?\s?[.-]?(\d{3})[\s.-]?(\d{4})$/;

// Telephone Type
type Telephone = string;
export default Telephone;

/** Format Telephone
 * 
 * Used to format / sanitize email input.
 * 
 * @param {unknown} value 
 * @returns {Telephone}
 */
export function formatTelephone(value:unknown):Telephone {
    if(typeof value !== "string")
        throw new TypeError("Telphone must be stored in a string!");

    const match = value.match(TELEPHONE_REGEX);
    if(match === null)
        throw new TypeError("Telephone is not formated correctly!");

    let country = match[1] || "";
    const number = `(${match[2]}) ${match[3]}-${match[4]}`

    if(country.length > 0) {
        if(country.charAt(0) !== "+")
            country = "+"+country;

        return country+" "+number;
    }

    return number;
}

/** Validate Telephone
 * 
 * @param {unknwon} value 
 * @returns {boolean}
 */
export function isTelephone(value:unknown):value is Telephone {
    try {
        formatTelephone(value)
    } catch (e){
        return false;
    }

    return true;
}

