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
    constructor(type:V, value?:T[]){
        if(value){
            if(!Array.isArray(value))
                throw new TypeError("Default value is not a List!");

            value = value.map((v)=>type.run(v));
        }
        super(ListName, formatListGenerator(type, value));
    }
}

/** Format List Generator
 * 
 * @param {Type<any>}type 
 * @returns {Function}
 */
function formatListGenerator<T extends Type, V extends TypeValidator<T>>(type:V, ifEmpty?:T[]):format<List<T>> {
    
    /** Format List
     * 
     * @param {unknown} input
     * @returns {List<Type>}
     */
    return function formatList(input:unknown):List<T> {
        input = emptyHandler(input, ListName, ifEmpty);
        return objectify(input).map(value=>type.run(value));
    }
}

/** List Objectifier
 * 
 * @param {unkown} value 
 * @returns {Array<unknown>}
 */
function objectify(value:unknown):unknown[] {
    switch(typeof value){
        case "string":
            return objectify(JSON.parse(value));

        case "object":
            if(Array.isArray(value))
                return value;

        default:
            throw new TypeError(`Invalid type list: '${value}'`);
    }
}