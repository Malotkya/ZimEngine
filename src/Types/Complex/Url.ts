/** /Types/Complex/Url
 * 
 * @author Alex Malotky
 */

//Help from: https://stackoverflow.com/questions/7109143/what-characters-are-valid-in-a-url
const URL_REGEX = /^(https?):\/\/([a-z0-9.][a-z0-9-.]+[a-z0-9.])(:\d{1,5})?(\?[a-z-._~:/#\[\}@!$&'\(\)*+,:%=]+)?/;

/** Url Type
 * 
 */
type Url = string;
export default Url;

/** Url Format Type
 * 
 */
export type UrlType = "Url";

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

    const format = value.toLocaleLowerCase();
    if(format.match(URL_REGEX) === null)
        throw new TypeError("Url is not formated correctly!");

    return format;
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