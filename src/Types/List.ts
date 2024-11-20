/** /Types/List
 * 
 * @author Alex Malotky
 */
import Primitive, {PrimitiveType} from "./Primitive";
import Complex, {ComplexType} from "./Complex";
import Empty, {EmptyType} from "./Empty";

type List<T = Primitive|Complex|Empty> = Array<T>;
export default List;

export type ListType = Array<PrimitiveType|ComplexType|EmptyType>;

/** Format List
 * 
 * @param {unknown} value 
 * @param {RegExp|string} split = "JSON"
 * @returns {List<unknown>}
 */
export function formatList(value:unknown, split:RegExp|string = "JSON"):List<unknown> {
    switch (typeof value){
        case "string":
            if(split === "JSON") {
                value = JSON.parse(value);
            } else {
                value = value.split(split);
            }

        case "object":
            if(Array.isArray(value))
                return value;
    }

    throw new TypeError("List must be stored either in an array object or a string!");
}