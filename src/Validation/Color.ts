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
        super(ColorName, defaultFormatGenerator(formatColor, ColorName, value));
    }
}

