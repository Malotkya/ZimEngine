/** /Engine/View/Html/Head/Base
 * 
 * @author Alex Malotky
 */
import HTMLElement from "..";
import BaseInit from "../Element/Base";

export type {BaseInit};

/** Base Tag
 * 
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base
 * @param {BaseAttributes} value 
 * @returns {HTMLContent}
 */
export default function Base(value:BaseInit):HTMLElement {
    if(value.href === undefined && value.target === undefined){
        throw new TypeError("Base must have at least a href or target value!");
    }
    const href = value.href? `href="${value.href} "`: "";
    const target = value.target? `target="${value.target} "`: "";

    return "<base "+target+href+"/>";
}