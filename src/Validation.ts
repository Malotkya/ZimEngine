import Type, {TypeClass, BasicNames, TypeNames, BASIC_NAMES} from "./Types";
import { BooleanType } from "./Types/Boolean";
import { ColorType } from "./Types/Color";
import { DateType } from "./Types/Date";
import { DateTimeType } from "./Types/DateTime";
import { EmaiType } from "./Types/Email";
import { FileType } from "./Types/File";
import { NumberType } from "./Types/Number";
import { StringType } from "./Types/String";
import { TelephoneType } from "./Types/Telephone";
import { TimeType } from "./Types/Time";
import { UrlType } from "./Types/Url";
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
    boolean:   ()=>new BooleanType(),
    number:    ()=>new NumberType(),
    string:    ()=>new StringType(),
    Color:     ()=>new ColorType(),
    Date:      ()=>new DateType(),
    DateTime:  ()=>new DateTimeType(),
    Email:     ()=>new EmaiType(),
    File:      ()=>new FileType(),
    Telephone: ()=>new TelephoneType(),
    Time:      ()=>new TimeType(),
    Url:       ()=>new UrlType(),
    List:   (props:TypeClass<any>[])=>new ListType(props[0]),
    Object: (props:Dictionary<TypeClass<any>>)=>new ObjectType(props),
    //Optional: (type:TypeClass<any>)
}

export type TypeOf<T extends TypeClass<any>> = T["_type"];
