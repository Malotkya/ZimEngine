/** /Types/Complex
 * 
 * @author Alex Malotky
 */
import Color, {isColor, ColorType} from "./Color";
import DateTime, {isDateTime, DateTimeType} from "./DateTime";
import Date, {isDate, DateType} from "./Date";
import Time, {isTime, TimeType} from "./Time";
import Email, {isEmail, EmailType} from "./Email";
import Url, {isUrl, UrlType} from "./Url";
import Telephone, {isTelephone, TelType} from "./Telephone";
import File, {FileType} from "./File"

type Complex = Color|DateTime|Date|Time|Email|Url|Telephone|File;
export default Complex;

export type ComplexType = ColorType|DateTimeType|DateType|TimeType|EmailType|UrlType|TelType|FileType;

/** Type Of Complex
 * 
 * Works like typeof for Complex Types
 * 
 * @param {Complex} value 
 * @returns {ComplexType}
 */
export function complexTypeOf(value:Complex):ComplexType|"None"{
    if(typeof value === "string") {

        if(isColor(value)) {
            return "Color";

        } else if(isDateTime(value)) {
            return "DateTime";

        } else if(isDate(value)) {
            return "Date";

        } else if(isTime(value)) {
            return "Time";

        } else if(isEmail(value)) {
            return "Email";

        } else if(isUrl(value)) {
            return "Url";

        } else if(isTelephone(value)) {
            return "Telephone";

        }
    } else if(value instanceof Blob){
        return "File";
    }

    return "None";
}