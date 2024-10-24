/** /Engine/View/Html/Head/Script
 * 
 * @author Alex Malotky
 */
import HTMLElement from "..";
import { buildAttributesString, AttributeList } from "../Attributes";
import ScriptAttributes from "../Element/Script";

export interface ScriptInit extends ScriptAttributes {
    value?:string /* unofficial */
}

export interface ScriptUpdate extends AttributeList{
    async?:boolean,
    nomodule?:boolean,
    src?:string,
    type?: "importmap"|"module"|"specultaionrules",
    value?:string
}

/** Script Tag
 * 
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
 * @param {ScriptInit} value
 * @returns {HTMLContent}
 */
export default function Script(value:ScriptInit):HTMLElement {
    if(value.value === undefined && value.src === undefined)
        throw new Error("Script must have a content or a source!");

    const content = value.value;
    value.value = "";

    return "<script "+buildAttributesString(value)+">"+(content || "")+"</script>";
}