/** /Validation/List
 * 
 * @author Alex Malotky
 */
import Type, {List, format, TypeValidator} from "./Type";
import { emptyHandler } from "./Type/Empty";

//List Format Name
export const ListName = "List";

/** List Validator
 * 
 */
export default class ListValidator<T extends Type, V extends TypeValidator<T>> extends TypeValidator<List<T>> {
    constructor(type:V, seperator?:string|RegExp, value?:T[]){
        if(value){
            if(!Array.isArray(value))
                throw new TypeError("Default value is not a List!");

            value = value.map((v)=>type.run(v));
        }
        super(ListName, formatListGenerator(type, seperator, value));
    }
}

/** Format List Generator
 * 
 * @param {Type<any>}type 
 * @returns {Function}
 */
function formatListGenerator<T extends Type, V extends TypeValidator<T>>(type:V, seperator?:string|RegExp, ifEmpty?:T[]):format<List<T>> {

    /** Format List
     * 
     * @param {unknown} input
     * @returns {List<Type>}
     */
    return function formatList(input:unknown):List<T> {
        return emptyHandler(input, (value:unknown)=>objectify(input, seperator).map(value=>type.run(value)), ListName, ifEmpty);
    }
}



/** List Objectifier
 * 
 * @param {unkown} value 
 * @returns {Array<unknown>}
 */
function objectify(value:unknown, seperator:string|RegExp|null = null):unknown[] {
    switch(typeof value){
        case "string":
            if(seperator === null)
                return objectify(JSON.parse(value));
            else
                return value.split(seperator);

        case "object":
            if(Array.isArray(value))
                return value;

        default:
            throw new TypeError(`Invalid type list: '${value}'`);
    }
}