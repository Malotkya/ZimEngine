/** /Types/Object
 * 
 * @author Alex Malotky
 */
import Primitive, {PrimitiveType} from "./Primitive";
import Complex, {ComplexType} from "./Complex";
import Empty, {EmptyType} from "./Empty";

type Object<T = Primitive|Complex|Empty> = Dictionary<T>;
export default Object;

export type ObjectType = Dictionary<PrimitiveType|ComplexType|EmptyType>;

/** Format List
 * 
 * @param {unknown} value 
 * @param {RegExp|string} split = "JSON"
 * @returns {List<unknown>}
 */
export function formatList(value:unknown, map:Dictionary<string>):Object<unknown> {
    switch (typeof value){
        case "string":
            value = JSON.parse(value);

        case "object":
            return value;
                
    }

    throw new TypeError("Object must be stored either in an object or a string!");
}