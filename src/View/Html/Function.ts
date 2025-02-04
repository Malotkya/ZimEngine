/** /View/Html/Function
 * 
 * @author Alex Malotky
 */

/** Convert Function to String
 * 
 * Will convert a function to a string so that it can be executed on the front end.
 * 
 * !! Does loose its scope !!
 * 
 * @param {Function} fun 
 * @returns {string}
 */
export function toAttribute(fun:Function):string {
    const str = ""+fun;
    return str.substring(str.indexOf("{")+1, str.lastIndexOf("}")-1)
              .replace(/\s+/g, " ").trim();
}

export function toContent(fun:Function):string {
    const str = ""+fun;
    const match = str.match(/^(?:(?:(?:async\s+)?function\s+(\w+)\(.*?\)\s*)|(?:const\s+(\w+)\s+=\s+(?:async)?\(.*?\)\s+=>\s+)){/i);
    if(match === null){
        throw new Error("Unable to find function name!")
    }

    const name = match[1] || match[2];
    return str + `;${name}(env);`;
}