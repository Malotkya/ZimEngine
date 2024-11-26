/** /Validation/Object
 * 
 * @author Alex Malotky
 */
import { TypeOf } from ".";
import Type, {Object, TypeValidator, format} from "./Type";
import { emptyHandler } from "./Type/Empty";


//Object Format Name
export const ObjectName = "Object";

export type ObjectProperties = Record<string, TypeValidator<any>>;
export type ObjectDefaults<K extends string|number|symbol> = { [key in K]?:Type }

/** Object Validator
 * 
 */
export default class ObjectValidator<P extends ObjectProperties> extends TypeValidator<{[K in keyof P]: TypeOf<P[K]>}> {

    constructor(format:P, value?:ObjectDefaults<keyof P>) {
        if(value){
            if(typeof value !== "object")
                throw new TypeError("Default value is not an object!");

            value = buildObject(format, value);
        }
        super(ObjectName, formatObjectGenerator(format, value));
    }

    simplify(value: { [K in keyof P]: TypeOf<P[K]>; }): string {
        return JSON.stringify(value);
    }
}

/** Format Object Generator
 * 
 * @param {Object} props 
 * @returns {Function}
 */
function formatObjectGenerator<P extends ObjectProperties>(props:P, ifEmpty?:ObjectDefaults<keyof P>):format<Object<keyof P>> {
    
    /** Format Object
     * 
     * @param {unknown} input
     * @returns {Object}
     */
    return function formatObject(input:unknown):Object<keyof P> {
        return emptyHandler<Object<keyof P>>(input, (value:unknown)=>buildObject(props, objectify(value), ifEmpty), ObjectName, ifEmpty as any);
    }
}

/** Build Object
 * 
 * @param {ObjectProperties} props 
 * @param {Object} value 
 * @returns {Object}
 */
function buildObject<P extends ObjectProperties>(props:P, value:Record<string, unknown>, defaultValue:Record<string, Type> = {}):Object<keyof P> {
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
        output[name] = props[name].run(defaultValue[name]);
    }

    return output as any;
}

/** Object Objectifier
 * 
 * @param {unkown} value 
 * @returns {Record<string, unknown>}
 */
function objectify(value:unknown):Record<string, unknown> {
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