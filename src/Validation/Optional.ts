/** /Validation/Optional
 * 
 * @author Alex Malotky
 */
import Type, {Optional, format, TypeValidator} from "./Type";
import { isEmpty } from "./Type/Empty";

//Optional Format Name
export const OptionalName = "Optional";

/** Optional Validator
 * 
 */
export default class OptionalValidator<T extends Type> extends TypeValidator<Optional<T>> {
    constructor(type:TypeValidator<T>, value?:Optional<T>) {
        if(value){
            value = type.run(value);
        }
        super(OptionalName, formatOptionalGenerator(type, value));
    }
}

/** Format Optiona Generator
 * 
 * @param {TypeValidator<any>} type 
 * @param {Optional} ifEmpty 
 */
function formatOptionalGenerator<T extends Type>(type:TypeValidator<T>, ifEmpty:Optional<T> = null):format<Optional<T>> {

    /** Format Optional
     * 
     * @param {unknown} value
     * @returns {Optional}
     */
    return function formatOptional(value:unknown):Optional<T> {
        if(isEmpty(value)) {
            return ifEmpty;
        }

        return type.run(value);
    }
}