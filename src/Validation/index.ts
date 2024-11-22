/*import {TypeClass, BasicNames, TypeNames, BASIC_NAMES} from "./Validation";
import { BooleanType } from "./Validation/Boolean";
import Color, { ColorType } from "./Validation/Color";
import Date, { DateType } from "./Validation/Date";
import DateTime, { DateTimeType } from "./Validation/DateTime";
import Email, { EmaiType } from "./Validation/Email";
import File, { FileType } from "./Validation/File";
import { NumberType } from "./Validation/Number";
import { StringType } from "./Validation/String";
import Telephone, { TelephoneType } from "./Validation/Telephone";
import Time, { TimeType } from "./Validation/Time";
import Url, { UrlType } from "./Validation/Url";
//import { ObjectType } from "./Types/Object";
//import { ListType } from "./Types/List";
import { EmptyType } from "./Validation/Empty";

/** Basic Types Map
 * 
 * Can hopefully use this to create a function that takes easier to read objects.
 */
/*const Basic_Type_Map = {
    "boolean": BooleanType,
    "number": NumberType,
    "string": StringType,
    "Color": ColorType,
    "Date": DateType,
    "DateTime": DateTimeType,
    "Email": EmaiType,
    "File": FileType,
    "Telephone": TelephoneType,
    "Time": TimeType,
    "Url": UrlType
}
type BasicTypes = typeof Basic_Type_Map;

export default {
    boolean:   (defaultValue?:boolean) =>new BooleanType(defaultValue),
    number:    (defaultValue?:number)  =>new NumberType(defaultValue),
    string:    (defaultValue?:string)  =>new StringType(defaultValue),
    Color:     (defaultValue?:Color)   =>new ColorType(defaultValue),
    Date:      (defaultValue?:Date)    =>new DateType(defaultValue),
    DateTime:  (defaultValue?:DateTime)=>new DateTimeType(defaultValue),
    Email:     (defaultValue?:Email)   =>new EmaiType(defaultValue),
    Telephone: (defaultValue?:Telephone)=>new TelephoneType(defaultValue),
    Time:      (defaultValue?:Time)=>new TimeType(defaultValue),
    Url:       (defaultValue?:Url)=>new UrlType(defaultValue),
    File:      ()=>new FileType(),
    //List:      (props:TypeClass<any>[], defaultValue?:boolean)=>new ListType(props[0]),
    //Object:    (props:Dictionary<TypeClass<any>>, defaultValue?:boolean)=>new ObjectType(props),
    //Optional: (type:TypeClass<any>)
}

export type TypeOf<T extends TypeClass<any>> = T["_type"];

/** Basic Names Helper Array
 * 
 * Hopefully Am able to use this later
 */
/*export const BASIC_NAMES = [
    BooleanName, NumberName, StringName,
    ColorName, DateTimeName, DateName, EmailName, FileName,  TelephoneName, TimeName, UrlName
] as const;

//Name Types
export type BasicNames = typeof BASIC_NAMES[number]
export type TypeNames  = BasicNames | Dictionary<BasicNames> | Array<BasicNames>;
*/