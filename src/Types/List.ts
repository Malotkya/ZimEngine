/** /Types/List
 * 
 * @author Alex Malotky
 */
import Type, { Validator, BASE_TYPE_MAP, BaseType, getValidator } from ".";

//List Type
type List<T extends BaseType> = Array<BASE_TYPE_MAP[T]>;
export default List;

//List Format Name
export  type ListType = [BaseType];
export const ListName = (name:BaseType) => `List<${name}>`;

/** List Validator
 * 
 */
export class ListValidator<I extends BaseType> extends Validator<List<I>> {
    constructor(name:I, value:unknown){
        const validator = getValidator(name);
        super(
            ListName(name),
            formatList(value).map(value=>new validator(value).value) as List<I>
        );
    }
}

/** Format List
 * 
 * @param {unknown} value 
 * @param {RegExp|string} split = "JSON"
 * @returns {List<unknown>}
 */
export function formatList(value:unknown, split:RegExp|string = "JSON"):Array<unknown> {
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