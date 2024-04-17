/** /Util
 * 
 * @author Alex Malotky 
 */

export type HeadersInit = Data<string>

export interface Data<t> {
    get(name:string):t|undefined,
    set(name:string, value:t):void
    delete(name:string):void
    entries():IterableIterator<[string, t]>
    [name:string]:any;
}

/** Sleep
 * 
 * @param {number} n 
 */
export function sleep(n:number=1):Promise<void>{
    return new Promise(res=>{
        setTimeout(res, n)
    });
}

/** Does Dictionary Include Name
 * 
 * @param {Dictionary} dictionary 
 * @param {string} name 
 * @returns {boolean}
 */
export function dictionaryInclude(dictionary:Dictionary<any>, name:string):boolean{
    for(let test in dictionary){
        if(test === name)
            return true;
    }

    return false;
}

/** Get File
 * 
 * Different IMplementation depending on environment.
 * 
 * @param {string} name 
 * @returns {string}
 */
export function getFile(...args:Array<string>):string {
    if((typeof process !== 'undefined') && (process.release.name === 'node')){
        const fs = require("node:fs");
        const path = require("node:path")
        return fs.readFileSync(path.join(...args)).toString();
    }

    return require(args[args.length-1]);
}