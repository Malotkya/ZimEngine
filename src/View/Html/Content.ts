/** /View/Html/Content
 * 
 * @author Alex Malotky
 */
import { toString as funToString } from "./Function";
import Element,{ isElement, compileElement } from "./Element";

/** Content Type
 * 
 */
type Content = string|number|boolean|null|undefined|Function|Element|Array<Content>;
export default Content;

/** Compress Content
 * 
 * @param {Content} content 
 * @returns {string}
 */
export function compressContent(content:Content):string {
    if(Array.isArray(content)){
        let buffer:string = "";
        for(let child of content)
            buffer += compressContent(child);
        return buffer;
    } else if(content === null || content === undefined){
        return "";
    } else {
        switch (typeof content){
            case "function":
                return funToString(content);

            case "object":
                if(isElement(content)) {
                    return compileElement(content)
                }
                return JSON.stringify(content);

            case "string":
                return content;

            default:
                return String(content);
        }
        
    }
}

/** Convert Content To Update
 * 
 * @param {Dictionary<Content>} value 
 * @returns {Dictionary<string>|undefined}
 */
export function toUpdate(value:Record<string, Content>|undefined):Record<string, string>|undefined {
    if(value === undefined)
        return undefined;

    const output:Record<string, string> = {};
    for(const name in value){
        output[name] = compressContent(value[name]);
    }

    return output;
}