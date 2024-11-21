/** /Types
 * 
 * @author Alex Malotky
 */
import Boolean, { BooleanName } from "./Boolean";
import Color, { ColorName } from "./Color";
import Date, { DateName } from "./Date";
import DateTime, { DateTimeName } from "./DateTime";
import Email, { EmailName } from "./Email";
import File, { FileName } from "./File";
import Number, { NumberName } from "./Number";
import String, { StringName } from "./String";
import Telephone, { TelephoneName } from "./Telephone";
import Time, { TimeName } from "./Time";
import Url, { UrlName } from "./Url";
//import Object from "./Object";
//import List from "./List";
import Empty from "./Empty";

type Type = Boolean|Color|Date|DateTime|Email|Empty|File|Number|String|Telephone|Time|Url; //|List<any>;
export default Type;

export {TypeClass} from "./Util";

/** Basic Names Helper Array
 * 
 * Hopefully Am able to use this later
 */
export const BASIC_NAMES = [
    BooleanName, NumberName, StringName,
    ColorName, DateTimeName, DateName, EmailName, FileName,  TelephoneName, TimeName, UrlName
] as const;

//Name Types
export type BasicNames = typeof BASIC_NAMES[number]
export type TypeNames  = BasicNames | Dictionary<BasicNames> | Array<BasicNames>;