/** /Validation/Types/Date
 * 
 * @author Alex Malotky
 */
const DATE_REGEX = /^(\d{1,4})[\-\/\\.](\d{1,2})[\-\/\\.](\d{1,2})$/;

// Date Type
type Date = string;
export default Date;

/** Format Date
 * 
 * Used to format / sanitize email input.
 * 
 * @param {unknown} value 
 * @returns {Date}
 */
export function formatDate(value:unknown):Date {
    if(typeof value !== "string")
        throw new TypeError("Date must be stored in a string!");

    const match = value.match(DATE_REGEX)
    if( match === null)
        throw new TypeError("Date is not formated correctly!");

    return combineDate(Number(match[1]), Number(match[2]), Number(match[3]))
}

/** Combine Date
 * 
 * @param {number} y 
 * @param {number} m 
 * @param {number} d 
 * @returns {Date}
 */
export function combineDate(y:number, m:number, d:number):Date {
    if(!validateDateParts(y, m, d))
        throw new Error("Date is invalid!");

    const year = `000${y}`.slice(-4);
    const month = `0${m}`.slice(-2);
    const day = `0${d}`.slice(-2);

    return `${year}-${month}-${day}`;
}

/** Validate Date Parts
 * 
 * @param {number} year 
 * @param {number} month 
 * @param {number} day 
 * @returns {boolean}
 */
export function validateDateParts(year:number, month:number, day: number):boolean {
    if( day <= 0 || year <= 0)
        return false;
    
    switch (month){
        case 1:  //January
        case 3:  //March
        case 5:  //May
        case 7:  //July
        case 8:  //August
        case 10: //October
        case 12: //December
            return day <= 31;

        case 4:  //April
        case 6:  //June
        case 9:  //September
        case 11: //November
            return day <= 30;

        case 2: //Febuary
            if(isLeapYear(year))
                return day <= 29;
            return day <= 28;
    }

    return false;
}

/** Is Leap Year
 * 
 * @param {number} year 
 */
function isLeapYear(year:number):boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Is Date
 * 
 * @param {unknwon} value 
 * @returns {boolean}
 */
export function isDate(value:unknown):value is Date {
    try {
        formatDate(value)
    } catch (e){
        return false;
    }

    return true;
}

