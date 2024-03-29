/** /Util
 * 
 * @author Alex Malotky 
 */

/** Sleep
 * 
 * @param {number} n 
 */
export function sleep(n:number=1):Promise<void>{
    return new Promise(res=>{
        setTimeout(res, n)
    });
}

/** Join Paths
 * 
 * @param {Array<string>} paths 
 * @returns {string}
 */
export function join(...paths:Array<string>):string{
    return paths.join("/")
        .replace(/\/+/gm, "/") //Remove any multiple slashes
        .replace(/\/$/, "");   //Remove trailing slash
}