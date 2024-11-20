import Color, { ColorValidator } from "./Complex/Color";
import DateTime, { DateTimeValidator } from "./Complex/DateTime";
import Date,{ DateValidator } from "./Complex/Date";
import Time,{ TimeValidator } from "./Complex/Time";
import Email,{ EmailValidator } from "./Complex/Email";
import Telephone,{ TelValidator } from "./Complex/Telephone";
import Url,{ UrlValidator } from "./Complex/Url";
import File, { FileValidator } from "./Complex/File";
import { ComplexType } from "./Complex";
import { BooleanValidator } from "./Primitive/Boolean";
import { NumberValidator } from "./Primitive/Number";
import { StringValidator } from "./Primitive/String";
import { PrimitiveType } from "./Primitive";
import Empty, { EmptyType, EmptyValidator } from "./Empty";
import Object, { ObjectType, ObjectValidator } from "./Object";

//All possible types as a type.
type Type = Color|DateTime|Date|Time|Email|Telephone|Url|File|boolean|number|string|Empty|Object
export default Type;

export type TypeName = PrimitiveType|ComplexType|EmptyType|ObjectType

/** Base Type Map
 * 
 * (Used by List/Object/Optional types)
 */
export interface BASE_TYPE_MAP {
    "Color": Color
    "DateTime": DateTime
    "Date": Date
    "Time": Time
    "Email": Email
    "Telephone": Telephone
    "Url": Url
    "File": File
    "boolean": boolean,
    "string": string,
    "number": number
    "Object": Object,
    "Empty": Empty
}
export type BaseType = keyof BASE_TYPE_MAP;

/** Validator Abstract Class
 * 
 */
export abstract class Validator<T> {
    private _value:T;
    private _name:string;
    readonly _type:T = null as any;

    constructor(name:string, value:T) {
        this._name = name;
        this._value = value;
    }

    get name():string {
        return this._name;
    }

    get value():T {
        return this._value;
    }
}

/** List of ALl Validators used by getter funciton.
 * 
 */
const ValidatorMap = {
    "Color": ColorValidator,
    "DateTime": DateTimeValidator,
    "Date": DateValidator,
    "Time": TimeValidator,
    "Email": EmailValidator,
    "Telephone": TelValidator,
    "Url": UrlValidator,
    "File": FileValidator,
    "boolean": BooleanValidator,
    "string": StringValidator,
    "number": NumberValidator,
    "Empty": EmptyValidator
}

//Types USed by Get Valdiator Function
export type ValidatorTypeMap = typeof ValidatorMap;
export type ValidatorName = keyof ValidatorTypeMap;

/** Get Validator
 * 
 * @param {string|Array|Object} name 
 */
export function getValidator<N extends ValidatorName>(name:N):ValidatorTypeMap[N]
/*export function getValidator<T extends ListType>(name:T):typeof ListValidator<T[0]> */
export function getValidator(name:ObjectType):ObjectValidator
export function getValidator(name:ValidatorName|ObjectType):typeof Validator<any> {
    switch (typeof name){
        case "string":
            for(const validatorName in ValidatorMap){
                if(validatorName === name){
                    return ValidatorMap[validatorName]
                }
            }
            throw new Error(`Invalid name '${name}'!`);
        
        case "object":
            /*if(Array.isArray(name)){
                return ListValidator<typeof name[0]>
            } else {*/
                return ObjectValidator;
            //}
        
        default:
            throw new TypeError("Name must be a string, object, or array!")
    }

    
}

/** Type Of Validator Getter
 * 
 */
export type TypeOf<T extends Validator<any>> = T['_type'];

/** Is Validator Checker
 * 
 * @param {unknown} value 
 * @param {string} name 
 * @returns {boolean}
 */
export function isValidator<N extends ValidatorName>(value:unknown, name:N): value is ValidatorTypeMap[N] {
    if(value instanceof Validator){
        return value.name === name;
    }

    return false;
}