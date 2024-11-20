/** /Types/Object
 * 
 * @author Alex Malotky
 */
import Type, { TypeName, Validator, getValidator, ValidatorName } from ".";

//Object Type
type Object = Dictionary<Type>;
export default Object;

//Object Format Name
export type  ObjectType = Dictionary<TypeName>;
export const ObjectName = "Object";

export class ObjectValidator extends Validator<Object> {
    constructor(value:unknown) {
        const obj = formatObject(value);
        for(let name in obj){

        }
        super(ObjectName, value)
    }
}

/** Format Object
 * 
 * @param {unknown} value 
 * @returns {Object}
 */
export function formatObject(value:unknown):Object {
    const output:Object = {};
    const input = objectify(value);
    for(const name in input){
        const validator:ValidatorName = input[name];
        getValidator();
    }
    switch (typeof value){
        case "string":
            value = JSON.parse(value);

        case "object":
            if(value !== null && value !== undefined) {
                //@ts-ignore
                return value;
            }
    }

    throw new TypeError("Object must be stored either in an object or a string!");
}

export function objectify(value:any):ObjectType {
    const type = typeof value;
    if(value === "string"){
        return objectify(JSON.parse(value));
    } else if(value === "object" && value !== null){
        return value;
    }
    
    throw new TypeError(`Recieved invalid type '${type}' for object!`);
}