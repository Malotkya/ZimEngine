/** /Validation/Types/Color
 * 
 * @author Alex Malotky
 */
const COLOR_REGEX = /^#[0-9a-f]{6}$/;

//Color Type
type Color = string;
export default Color;

 /** Format Color
 * 
 * @param value 
 */
export function formatColor(value:unknown):Color {
    if(typeof value !== "string") 
        throw new TypeError("Color must be stored in a string!");

    const format = value.toLocaleLowerCase();
    if(format.match(COLOR_REGEX) === null)
        throw new TypeError("Color is not formated correctly!")

    return format;
}

/** Is Color
 * 
 * @param {unknown} value 
 * @returns {boolean}
 */
export function isColor(value:unknown):value is Color {
    try {
        formatColor(value)
    } catch(e){
        return false;
    }

    return true;
}