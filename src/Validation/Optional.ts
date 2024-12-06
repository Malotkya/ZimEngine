/** /Validation/Optional
 * 
 * @author Alex Malotky
 */
import Type, {Optional, format, TypeValidator, Simple} from "./Type";
import { isEmpty } from "./Type/Empty";

//Optional Format Name
export const OptionalName = "Optional";

/** Optional Validator
 * 
 */
export default class OptionalValidator<T extends Type> extends TypeValidator<Optional<T>> {
    private _proto:TypeValidator<T>;

    constructor(type:TypeValidator<T>, value?:Optional<T>) {
        if(value){
            value = type.run(value);
        }
        super(OptionalName, formatOptionalGenerator(type, value));
        this._proto = type;
    }

    simplify(value: Optional<T>): Simple {
        if(value)
            return this._proto.simplify(value);

        return null;
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
        if(type.name === "string" && isEmpty(value, true)) {
            if(typeof value === "string")
                return value;
            
            return ifEmpty;

        } else if(isEmpty(value)) {

            return ifEmpty;
        }

        return type.run(value);
    }
}