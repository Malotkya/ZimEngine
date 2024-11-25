/** /Validation/Object
 * 
 * @author Alex Malotky
 */
import Type, {Object, TypeValidator, format} from "./Type";
import { emptyHandler } from "./Type/Empty";


//Object Format Name
export const ObjectName = "Object";

export type ObjectProperties = Record<string, TypeValidator<Type>>;

/** Object Validator
 * 
 */
export default class ObjectValidator<P extends ObjectProperties> extends TypeValidator<Object<keyof P>> {
    constructor(format:P, value?:Object<keyof P>) {
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
function formatObjectGenerator<P extends ObjectProperties>(props:P, ifEmpty:any):format<Object<keyof P>> {
    
    /** Format Object
     * 
     * @param {unknown} input
     * @returns {any}
     */
    return function formatObject(input:unknown):Object<keyof P> {
        return emptyHandler(input, (value:unknown)=>objectify(value), ObjectName, ifEmpty);
    }
}

/** Build Object
 * 
 * @param {ObjectProperties} props 
 * @param {Object} value 
 * @returns {Object}
 */
function buildObject<P extends ObjectProperties>(props:P, value:Dictionary<unknown>):Object<keyof P> {
    const output:Record<string, Type> = {};
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