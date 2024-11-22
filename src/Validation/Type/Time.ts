/** /Validation/Types/Time
 * 
 * @author Alex Malotky
 */
const TIME_REGEX = /^(\d{1,2}):(\d{1,2})(:AM|:PM)?$/;

// Time Type
type Time = string;
export default Time;

export type Format = ":AM"|":PM";

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

    const match = value.toLocaleUpperCase().match(TIME_REGEX)
    if( match === null)
        throw new TypeError("Time is not formated correctly!");

    const h = Number(match[1]);
    const m = Number(match[2]);
    const format = match[3] as Format;

    return combineTime(h, m, format);
}

function combineTime(h:number, m:number, format?:Format):Time{
    if(!validateTimeParts(h, m, format))
        throw new Error("Time is invalid!");

    if(format){
        h = convertToMilitary(h, format);
    }

    const hour = `0${h}`.slice(-2);
    const minute = `0${m}`.slice(-2);

    return hour+":"+minute;
}

function convertToMilitary(hour:number, format:Format):number {
    if(format === ":AM") {
        if(hour === 12)
            return 0;

        return hour;
    } else if(hour < 12){
        return hour + 12
    }

    return hour;
}

function validateTimeParts(hour:number, minute:number, format?:Format):boolean{
    if(minute < 0 || minute >= 60)
        return false;

    if(format){
        return hour >= 1 && hour <= 12
    }

    return hour >= 0 && hour <= 23
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
