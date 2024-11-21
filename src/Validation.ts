import {TypeClass, BasicNames, TypeNames, BASIC_NAMES} from "./Types";
import { BooleanType } from "./Types/Boolean";
import Color, { ColorType } from "./Types/Color";
import Date, { DateType } from "./Types/Date";
import DateTime, { DateTimeType } from "./Types/DateTime";
import Email, { EmaiType } from "./Types/Email";
import File, { FileType } from "./Types/File";
import { NumberType } from "./Types/Number";
import { StringType } from "./Types/String";
import Telephone, { TelephoneType } from "./Types/Telephone";
import Time, { TimeType } from "./Types/Time";
import Url, { UrlType } from "./Types/Url";
import { ObjectType } from "./Types/Object";
import { ListType } from "./Types/List";
import { EmptyType } from "./Types/Empty";

/** Basic Types Map
 * 
 * Can hopefully use this to create a function that takes easier to read objects.
 */
const Basic_Type_Map = {
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
    List:      (props:TypeClass<any>[], defaultValue?:boolean)=>new ListType(props[0]),
    Object:    (props:Dictionary<TypeClass<any>>, defaultValue?:boolean)=>new ObjectType(props),
    //Optional: (type:TypeClass<any>)
}

export type TypeOf<T extends TypeClass<any>> = T["_type"];
