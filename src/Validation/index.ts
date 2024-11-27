/** /Validation
 * 
 * @author Alex Malotky
 */
import Type, {Color, Date, DateTime, Email, Telephone, Time, Url, TypeValidator, List, Object, Simple} from "./Type";
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
import ObjectValidator, {ObjectProperties, ObjectDefaults} from "./Object";
import OptionalValidator from "./Optional";
import RecordValidator from "./Record";
import { isEmpty } from "./Type/Empty";

//Basic Helper Functions
export function boolean  (defaultValue?:boolean)  { return new BooleanValidator(defaultValue) };
export function number   (defaultValue?:number)   { return new NumberValidator(defaultValue) };
export function string   (defaultValue?:string)   {return new StringValidator(defaultValue) };
export function color    (defaultValue?:Color)    { return new ColorValidator(defaultValue) };
export function date     (defaultValue?:Date)     { return new DateValidator(defaultValue) };
export function datetime (defaultValue?:DateTime) { return new DateTimeValidator(defaultValue) };
export function email    (defaultValue?:Email)    { return new EmailValidator(defaultValue) };
export function telephone(defaultValue?:Telephone){ return new TelephoneValidator(defaultValue) };
export function time     (defaultValue?:Time)     { return new TimeValidator(defaultValue) };
export function url      (defaultValue?:Url)      { return new UrlValidator(defaultValue) };
export function empty    () { return new EmptyValidator() };
export function file     () { return new FileValidator() };

//Complex Helper Functions
export function list<T extends Type>(type:TypeValidator<T>, seperator?:string, defaultValue?:List<T>):ListValidator<T>{
    return new ListValidator(type, seperator, defaultValue)
}
export function object<P extends ObjectProperties>(properties:P, defaultValue?:ObjectDefaults<keyof P>):ObjectValidator<P> {
    return new ObjectValidator(properties, defaultValue);
}
export function optional<T extends Type>(type:TypeValidator<T>, defaultValue?:T|null):OptionalValidator<T> {
    return new OptionalValidator(type, defaultValue)
}
export function record<T extends Type>(type:TypeValidator<T>, defaultValue?:Record<string, T>) {
    return new RecordValidator(type, defaultValue);
}

//Get Type From Validator
export type TypeOf<T extends TypeValidator<Type>> = T["_type"];

export type DataConstraints<K extends string|number|symbol> = ObjectDefaults<K>;
export type {ObjectProperties}

/** Data Object 
 * 
 */
export default class DataObject<P extends ObjectProperties> extends ObjectValidator<P> {
    private _table:string;
    private _props:P;

    constructor(tableName:string, properties:P) {
        super(properties);
        this._table = tableName;
        this._props = properties;
    }

    /** Get Table Name
     * 
     */
    get name():string {
        return this._table;
    }

    /** Build Constraints
     * 
     * @param {DataConstraints} constraints 
     * @returns {Array}
     */
    buildConstraints(constraints?:DataConstraints<keyof P>):[string, Simple[]]{
        if(isEmpty(constraints))
            return ["", []];

        let string = "WHERE ";
        const values:Array<Simple> = []
        for(const name in constraints) {
            string += name + " = ? AND"
            values.push(this._props[name].simplify(constraints[name]));
        }

        string.slice(-3)
        return [string, values];
    }

    /** Build Insert
     * 
     * @param {Object} value 
     * @returns {Array}
     */
    buildInsertValues(value:Object<keyof P>):[string, Simple[]]{
        let queryNames:string = "(";
        let queryValues:string = "VALUES(";
        const values:Array<Simple> = [];

        for(const name in value) {
            queryNames  += name + ", ";
            queryValues += "?, ";
            values.push(this._props[name].simplify(value[name]));
        }
        queryNames.slice(-2)
        queryValues.slice(-2)
        return [`${queryNames}) ${queryValues})`, values]
    }

    /** Build Update
     * 
     * @param {Object} value 
     * @returns {Array}
     */
    buildUpdateValues(value:Object<keyof P>):[string, Simple[]] {
        let string:string = "SET ";
        const values:Array<Simple> = [];

        for(const name in value) {
            string  += name + " = ?, ";
            values.push(this._props[name].simplify(value[name]));
        }

        return [string, values];
    }
}