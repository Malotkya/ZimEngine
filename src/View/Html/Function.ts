/** Convert Function to String
 * 
 * Will convert a function to a string so that it can be executed on the front end.
 * 
 * !! Does loose its scope !!
 * 
 * @param {Function} fun 
 * @returns {string}
 */
export function toString(fun:Function):string {
    const str = ""+fun;
    return str.substring(str.indexOf("{")+1, str.lastIndexOf("}")-1)
              .replace(/\s+/g, " ").trim();
}