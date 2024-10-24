/** /Engine/View/Html/Head/Style
 * 
 * @author Alex Malotky
 */
import HTMLElement from "..";
import { AttributeList, buildAttributesString } from "../Attributes";
import StyleAttributes from "../Element/Style";

export interface StyleInit extends StyleAttributes {
    name?:string /* unofficial */
}

export interface StyleUpdate extends AttributeList{
    media?:string,
    value:string,
}

/** Style Tag
 * 
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style
 * @param {StyleInit} value
 * @returns {HTMLContent}
 */
export default function Style(value:StyleInit):HTMLElement {
    if(value.value === undefined)
        throw new Error("Style must have a content value!");

    const content = value.value;
    value.value = "";

    return "<style "+buildAttributesString(value)+">"+content+"</style>";
}