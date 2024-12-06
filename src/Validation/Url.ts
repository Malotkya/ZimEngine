/** /Validation/Url
 * 
 * @author Alex Malotky
 */
import { TypeValidator } from "./Type";
import { defaultFormatGenerator } from "./Util";
import Url, { formatUrl } from "./Type/Url";

//Url Format Name
export const UrlName = "Url";

/** Url Validator
 * 
 */
export default class UrlValidator extends TypeValidator<Url> {
    constructor(value?:Url){
        if(value){
            try {
                value = formatUrl(value)
            } catch (e){
                throw new TypeError(`${value} is not a valid Url!`);
            }
        }

        super(UrlName, defaultFormatGenerator(formatUrl, value))
    }
}

