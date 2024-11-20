/** /Types/Complex
 * 
 * @author Alex Malotky
 */
import Color, {ColorType, ColorName} from "./Color";
import DateTime, {DateTimeType} from "./DateTime";
import Date, {DateType} from "./Date";
import Time, {TimeType} from "./Time";
import Email, {EmailType} from "./Email";
import Url, {UrlType} from "./Url";
import Telephone, {TelType} from "./Telephone";
import File, {FileType} from "./File"

type Complex = Color|DateTime|Date|Time|Email|Url|Telephone|File;
export default Complex;

export type ComplexType = ColorType|DateTimeType|DateType|TimeType|EmailType|UrlType|TelType|FileType;