/** /Validation
 * 
 * @author Alex Malotky
 */
import Type, {Color, Date, DateTime, Email, Telephone, Time, Url, TypeValidator, List, Object, Optional} from "./Type";
import BooleanValidator from "./Boolean";
import NumberValidator from "./Number";
import StringValidator from "./String";
import ColorValidator from "./Color";
import DateValidator from "./Date";
import DateTimeValidator from "./DateTime";
import EmailValidator from "./Email";
import FileValidator from "./File";
import TelephoneValidator from "./Telephone";
import TimeValidator from "./Time";
import UrlValidator from "./Url";
import EmptyValidator from "./Empty";
import ListValidator from "./List";
import ObjectValidator, {ObjectProperties} from "./Object";
import OptionalValidator from "./Optional";

export default {
    //Basic Helper Functions
    boolean:   (defaultValue?:boolean)  =>new BooleanValidator(defaultValue),
    number:    (defaultValue?:number)   =>new NumberValidator(defaultValue),
    string:    (defaultValue?:string)   =>new StringValidator(defaultValue),
    Color:     (defaultValue?:Color)    =>new ColorValidator(defaultValue),
    Date:      (defaultValue?:Date)     =>new DateValidator(defaultValue),
    DateTime:  (defaultValue?:DateTime) =>new DateTimeValidator(defaultValue),
    Email:     (defaultValue?:Email)    =>new EmailValidator(defaultValue),
    Telephone: (defaultValue?:Telephone)=>new TelephoneValidator(defaultValue),
    Time:      (defaultValue?:Time)     =>new TimeValidator(defaultValue),
    Url:       (defaultValue?:Url)      =>new UrlValidator(defaultValue),
    Empty:     ()=>new EmptyValidator(),
    File:      ()=>new FileValidator(),
    // Complex Helper Functions
    List: function <T extends Type>(type:TypeValidator<T>, seperator?:string|RegExp, defaultValue?:List<T>):ListValidator<T, TypeValidator<T>>{
        return new ListValidator(type, seperator, defaultValue)
    },
    Object: function <O extends Object>(properties:ObjectProperties<keyof O>, defaultValue?:O):ObjectValidator<O, ObjectProperties<keyof O>> {
        return new ObjectValidator(properties, defaultValue);
    },
    Optional: function <T extends Type>(type:TypeValidator<T>, defaultValue?:T|null):OptionalValidator<T, TypeValidator<T>> {
        return new OptionalValidator(type, defaultValue)
    }
}

export type TypeOf<T extends TypeValidator<any>> = T["_type"];

/** Basic Types Map
 * 
 * Can hopefully use this to create a function that takes easier to read objects.
 */
/*const Basic_Type_Map = {
    "boolean": BooleanValidator,
    "number": NumberValidator,
    "string": StringValidator,
    "Color": ColorValidator,
    "Date": DateValidator,
    "DateTime": DateTimeValidator,
    "Email": EmailValidator,
    "File": FileValidator,
    "Telephone": TelephoneValidator,
    "Time": TimeValidator,
    "Url": UrlValidator
}
type BasicTypes = typeof Basic_Type_Map;

//Basic Names Helper Array
export const BASIC_NAMES = [
    BooleanName, NumberName, StringName,
    ColorName, DateTimeName, DateName, EmailName, FileName,  TelephoneName, TimeName, UrlName
] as const;

//Name Types
export type BasicNames = typeof BASIC_NAMES[number]
export type TypeNames  = BasicNames | Dictionary<BasicNames> | Array<BasicNames>;
*/