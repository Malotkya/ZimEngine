/** /Util
 * 
 * @author Alex Malotky
 */

export const HEADER_VALUE = "application/json";
export const HEADER_KEY   = "Update-Type";

/** Sleep
 * 
 * @param {number} n 
 */
export function sleep(n:number=1):Promise<void>{
    return new Promise(res=>{
        setTimeout(res, n)
    });
}

/** Dictionary Include
 * 
 * @param {Dictionary} dictionary 
 * @param {string} name 
 * @returns {boolean}
 */
export function dictionaryInclude(dictionary:Record<string, any>, name:string):boolean{
    for(let test in dictionary){
        if(test === name)
            return true;
    }

    return false;
}

/** Is Cloudfare Request
 * 
 * @param {any} request 
 * @returns {boolean}
 */
export function isCloudflareRequest(request:any):request is Request {
    return typeof request.formData === "function"
}

/** Detect Cloudflare Environment
 * 
 */
export function inCloudfareWorker():boolean {
    return typeof navigator !== "undefined" && navigator.userAgent === 'Cloudflare-Workers'
}

/** Detect Node Environment
 * 
 */
export function inNodeEnvironment():boolean {
    return (typeof process !== 'undefined') && (process.release.name === 'node')
}

/** Join Paths
 * 
 * @param paths 
 */
export function joinPath(...paths:Array<string>):string {
    return "/"+paths.map(part=>{
        if(part === "/")
            return "";

        if(part.charAt(0) === "/")
            part = part.slice(1);

        if(part.charAt(part.length-1) === "/")
            part = part.slice(-1);

        return part;
    }).filter(s=>s).join("/")
}