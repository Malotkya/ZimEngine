/** /Node
 * 
 * This file was created to hide from webpack, and remove the error/warning caused by
 * require call.
 * 
 * @author Alex Malotky
 */
import { inNodeEnvironment } from "./Util";

export function nodeImport(module:string):any {
    if(!inNodeEnvironment())
        throw new Error("Not in the Node Environment to import: "+module);

    return require(module);
}