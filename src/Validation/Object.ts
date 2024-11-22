/** /Validation/Object
 * 
 * @author Alex Malotky
 */
import Type, {Object, TypeValidator, format} from "./Type";
import { emptyHandler } from "./Type/Empty";


//Object Format Name
export const ObjectName = "Object";

export type ObjectProperties<K extends string|number|symbol> = Record<K, TypeValidator<any>>;

/** Object Validator
 * 
 */
export default class ObjectValidator<T extends Object, P extends ObjectProperties<keyof T>> extends TypeValidator<T> {
    constructor(format:P, value?:T) {
        if(value){
            if(typeof value !== "object")
                throw new TypeError("Default value is not an object!");

            value = buildObject(format, value);
        }
        super(ObjectName, formatObjectGenerator(format, value))
    }
}

/** Format Object Generator
 * 
 * @param {Object} props 
 * @returns {Function}
 */
function formatObjectGenerator<O extends Object>(props:ObjectProperties<keyof O>, ifEmpty:any):format<O> {
    
    /** Format Object
     * 
     * @param {unknown} input
     * @returns {any}
     */
    return function formatObject(input:unknown):O {
        return emptyHandler(input, (value:unknown)=>objectify(value), ObjectName, ifEmpty);
    }
}

/** Build Object
 * 
 * @param {ObjectProperties} props 
 * @param {Object} value 
 * @returns {Object}
 */
function buildObject<O extends Object>(props:ObjectProperties<keyof O>, value:Dictionary<unknown>):O {
    const output:Dictionary<Type> = {};
    const expected = Object.getOwnPropertyNames(props);

    for(const name in value){
        const index = expected.indexOf(name);
        if(index === -1)
            throw new Error(`Unexpected value occured at ${name}!`);
        
        expected.splice(index, 1);    
        output[name] = props[name].run(value[name]);
    }

    for(const name of expected){
        output[name] = props[name].run(null);
    }

    //@ts-ignore
    return output;
}

/** Object Objectifier
 * 
 * @param {unkown} value 
 * @returns {Dictionary<unknown>}
 */
function objectify(value:unknown):Dictionary<unknown> {
    switch (typeof value){
        case "string":
            return objectify(JSON.parse(value));

        case "object":
            if(Array.isArray(value))
                throw new TypeError(`Invalid object type: 'Array'!`);
            
            if(value === null)
                throw new TypeError(`Invalid object type: 'null'!`);
            
            return value as any;

        default:
            throw new TypeError(`Invalid object type: '${typeof value}'!`);
    }
}