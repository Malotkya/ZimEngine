/** /View/Html/Function
 * 
 * @author Alex Malotky
 */

/** Convert Function to Attibute String
 * 
 * Will convert a function to a string so that it can be executed on the front end.
 * 
 * !! Does loose its scope !!
 * 
 * @param {Function} fun 
 * @returns {string}
 */
export function toAttribute(fun:Function):string {
    return toContent(fun).replaceAll(/(?<=\s|;)event\w+/ig, "event")
              .replace(/\s+/g, " ").trim();
}

/** Convert Function to Content String
 * 
 * Will convert a function to a string so that it can be executed on the front end.
 * 
 * !! Does loose its scope !!
 * 
 * @param {Function} fun 
 * @returns {string}
 */
export function toContent(fun:Function):string {
    const str = ""+fun;
    return str.substring(str.indexOf("{")+1, str.lastIndexOf("}")-1)
              .replaceAll(/(?<=\s|;)env\w+/ig, "env").trim();
}