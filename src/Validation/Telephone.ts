/** /Validation/Telephone
 * 
 * @author Alex Malotky
 */
import { TypeValidator } from "./Type";
import { defaultFormatGenerator } from "./Util";
import Telephone, { formatTelephone } from "./Type/Telephone";

// Telephone Format Name
export const TelephoneName = "Telephone";

/** Telephone Validator
 * 
 */
export default class TelephoneValidator extends TypeValidator<Telephone> {
    constructor(value?:Telephone) {
        if(value){
            try {
                value = formatTelephone(value)
            } catch (e){
                throw new TypeError(`${value} is not a valid Telephone Number!`);
            }
        }

        super(TelephoneName, defaultFormatGenerator(formatTelephone, TelephoneName, value));
    }
}
