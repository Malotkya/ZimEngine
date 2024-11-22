/** /Validation/Types/Url
 * 
 * @author Alex Malotky
 */
//Help from: https://stackoverflow.com/questions/7109143/what-characters-are-valid-in-a-url
const URL_REGEX = /^(https?):\/\/([a-z0-9.][a-z0-9-.]+[a-z0-9.])(:\d{1,5})?(\/[a-z0-9.\-\/_~\!$&'\(\)*+,;=:@]*)?(#[a-zA-Z\-._~:\/#\[\}@!$&'\(\)*+,:%=]+)?(\?[a-zA-Z\-._~:\/#\[\}@!$&'\(\)*+,:%=]+)?/i;

// Url Type
type Url = string;
export default Url;

/** Format Url
 * 
 * Used to format / sanitize email input.
 * 
 * @param {unknwon} value 
 * @returns {Url}
 */
export function formatUrl(value:unknown):Url {
    if(typeof value !== "string")
        throw new TypeError("Url must be stored in a string!");

    const match = value.match(URL_REGEX);
    if(match === null)
        throw new TypeError("Url is not formated correctly!");

    const protocol = match[1].toLocaleLowerCase();
    const domain   = match[2].toLocaleLowerCase();
    const path     = match[3] || "";
    const hash     = match[4] || "";
    const search   = match[5] || "";

    return protocol+"://"+domain+path+hash+search;
}

/** Validate Url
 * 
 * @param {unknwon} value 
 * @returns {boolean}
 */
export function isUrl(value:unknown):value is Url {
    try {
        formatUrl(value)
    } catch (e){
        return false;
    }

    return true;
}