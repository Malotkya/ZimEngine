/** /Types/Empty
 * 
 * @author Alex Malotky
 */

type Empty = null|undefined;
export default Empty;

export type EmptyType = "Empty";

/** is Empty
 * 
 * @param {value} value 
 * @returns {boolean}
 */
export function isEmpty(value:unknown):value is Empty {
    return value === null || value === undefined;
}