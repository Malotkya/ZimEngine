/** /Types/List
 * 
 * @author Alex Malotky
 */
import {TypeClass, format} from ".";
import { emptyHandler } from "./Empty";

//List Type
type List<T extends TypeClass<any>> = Array<T>;
export default List;

//List Format Name
export const ListName = "List";

/** List Type Class
 * 
 */
export class ListType<T extends TypeClass<any>> extends TypeClass<List<T>> {
    constructor(type:T, value?:T[]){
        super(ListName, formatListGenerator(type, value));
    }
}

/** Format List Generator
 * 
 * @param {Type<any>}type 
 * @returns {Function}
 */
function formatListGenerator<T extends TypeClass<any>>(type:T, ifEmpty?:T[]):format<List<T>> {
    
    /** Format List
     * 
     * @param {unknown} input
     * @returns {List<Type>}
     */
    return function formatList(input:unknown):List<T> {
        input = emptyHandler(input, ListName, ifEmpty);
        return objectify(input).map(value=>type.format(value));
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