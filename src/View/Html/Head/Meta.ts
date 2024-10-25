/** /Engine/View/Html/Head/Meta
 * 
 * @author Alex Malotky
 */
import HTMLElement from "..";
import MetaInit from "../Element/Meta";
import { dictionaryInclude } from "../../../Util";

export type {MetaInit}
export type MetaUpdate = string;

/** Meta Tag
 * 
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
 * @param {MetaInit} value
 * @returns {HTMLContent}
 */
export default function Meta(value:MetaInit):HTMLElement {
    if(value.charset){
        return "<meta charset=\"utf-8\" />"
    }

    if(value.content === undefined)
        throw new Error("Meta must have content!");
    const content = "content=\""+value.content+"\" ";

    if(value.name !== undefined && value.httpEquiv !== undefined)
        throw new Error("Meta should only have name or http-equiv!");
    let name:string;
    if(value.name){
        name = "name=\""+value.name+"\" ";
    } else if(value.httpEquiv) {
        name = "http-equiv=\""+value.httpEquiv+"\" ";
    } else {
        throw new Error("Meta must have a name or http-equiv!");
    }

    return "<meta "+name+content+"/>";
}

/** Update Meta Tags
 * 
 */
export function mergeMeta(init:Array<MetaInit> = [], update:Dictionary<MetaUpdate> = {}):Array<MetaInit> {
    const output:Array<MetaInit> = JSON.parse(JSON.stringify(init));
    const list = Object.getOwnPropertyNames(update);

    for(let i=0; i<output.length; i++){
        if(output[i].name){
            const index = list.indexOf(output[i].name!);

            if(index >= 0){
                output[i].content = update[output[i].name!];
                list.splice(index, 1);
            }
        }
    }

    for(let name of list){
        output.push({
            content: update[name],
            name
        });
    }

    return output;
}


/** Update Meta Tags
 * 
 */
export function updateMeta(init:Array<MetaInit> = [], update:Dictionary<MetaUpdate> = {}):Dictionary<string> {
    const output:Dictionary<string> = JSON.parse(JSON.stringify(update));

    for(const item of init){
        if(item.name && item.content && !dictionaryInclude(output, item.name)){
            output[item.name] = item.content;
        }
    }

    return output;
}