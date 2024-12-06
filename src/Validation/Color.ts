/** //Validation/Color
 * 
 * @author Alex Malotky
 */
import { TypeValidator } from "./Type";
import { defaultFormatGenerator } from "./Util";
import Color, { formatColor } from "./Type/Color";

//Color Name
export const ColorName = "Color";

/** Color Validator
 * 
 */
export default class ColorValidator extends TypeValidator<Color> {
    constructor(value?:Color){
        if(value){
            try {
                value = formatColor(value)
            } catch (e){
                throw new TypeError(`${value} is not a valid Color!`);
            }
        }

        super(ColorName, defaultFormatGenerator(formatColor, value));
    }
}

