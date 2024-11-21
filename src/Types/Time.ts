/** /Types/Complex/Time
 * 
 * @author Alex Malotky
 */
import { TypeClass } from ".";

const TIME_REGEX = /^(\d{1,2}):(\d{1,2})$/;

// Time Type
type Time = string;
export default Time;

//Time Format Name
export const TimeName = "Time";

/** Time Type Class
 * 
 */
export class TimeType extends TypeClass<Time> {
    constructor(){
        super(TimeName, formatTime)
    }
}

/** Format Time
 * 
 * Used to format / sanitize email input.
 * 
 * @param {unknown} value 
 * @returns {Time}
 */
export function formatTime(value:unknown):Time {
    if(typeof value !== "string")
        throw new TypeError("Time must be stored in a string!");

    if(value.match(TIME_REGEX) === null)
        throw new TypeError("Time is not formated correctly!");

    return value;
}

/** Validate Time
 * 
 * @param {unknwon} value 
 * @returns {boolean}
 */
export function isTime(value:unknown):value is Time {
    try {
        formatTime(value)
    } catch (e){
        return false;
    }

    return true;
}

