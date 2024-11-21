/** /Types/Object
 * 
 * @author Alex Malotky
 */
import Type, {TypeClass} from ".";
import { emptyHandler } from "./Empty";

//Object Type
type Object = Dictionary<Type>;
export default Object;

//Object Format Name
export const ObjectName = "Object";

type ObjectProperties<K extends string|number|symbol> = Record<K, TypeClass<any>>;

/** Object Type Class
 * 
 */
export class ObjectType<T extends Object> extends TypeClass<T> {
    constructor(format:ObjectProperties<keyof T>, value?:Object) {
        super(ObjectName, formatObjectGenerator(format, value))
    }
}

/** Format Object Generator
 * 
 * @param {Object} props 
 * @returns {Function}
 */
function formatObjectGenerator<O extends Object, P extends ObjectProperties<keyof O>>(props:P, ifEmpty:any):(v:unknown)=>O {
    
    /** Format Object
     * 
     * @param {unknown} input
     * @returns {any}
     */
    return function formatObject(input:unknown):O {
        const buffer = objectify(emptyHandler(input, ObjectName, ifEmpty));
        //@ts-ignore
        const output:O = {};

        for(const name in buffer){
            if(props[name] === undefined)
                throw new Error(`Unexpected value occured at ${name}!`);

            //@ts-ignore
            output[name] = props[name].format(buffer[name]);
        }

        return output;
    }
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