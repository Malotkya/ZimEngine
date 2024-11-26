/** /Validation/Record
 * 
 * @author Alex Malotky
 */
import Type, {TypeValidator, format} from "./Type";
import { emptyHandler } from "./Type/Empty";
import { objectify } from "./Object";

//Record Fromat Name
export const RecordName = "Record";

/** Record Validator
 * 
 */
export default class RecordValidator<T extends Type> extends TypeValidator<Record<string, T>> {
    constructor(type:TypeValidator<T>, value?:Record<string, T>){
        if(value){
            try {
                value = buildRecord(type, value);
            } catch (e){
                throw new TypeError("Default value is not a Record!");
            }

            super(RecordName, formatRecordGenerator(type, value));
        }
    }
}

/** Format List Generator
 * 
 * @param {Type} type 
 * @param {Record} ifEmpty 
 * @returns {Function}
 */
function formatRecordGenerator<T extends Type>(type:TypeValidator<T>, ifEmpty?:Record<string, T>):format<Record<string,T>> {
    
    /** Format Record
     * 
     * @param {unknown} input
     * @returns {Record}
     */
    return function formatRecord(input:unknown):Record<string,T> {
        return emptyHandler(input, (value)=>buildRecord(type, objectify(input)), RecordName, ifEmpty);
    }
}

/** Build Record
 * 
 * @param {TypeValidator}type 
 * @param {Record} value 
 * @returns {Record}
 */
function buildRecord<T extends Type>(type:TypeValidator<T>, value:Record<string, unknown>):Record<string,T> {
    const output:Record<string, T> = {};

    for(const name in value) {
        output[name] = type.run(value[name]);
    }

    return output;
}