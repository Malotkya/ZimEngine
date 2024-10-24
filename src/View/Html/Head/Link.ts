/** /Engine/View/Html/Head/Link
 * 
 * @author Alex Malotky
 */
import HTMLElement from "..";
import { AttributeList, RefferPolicy, buildAttributesString } from "../Attributes";
import LinkInit from "../Element/Link";

export type {LinkInit}
export interface LinkUpdate extends AttributeList{
    disabled?:boolean,
    href: string,
    imagesrcset?:string,
    integrity?:string,
    media?:string,
    refferpolicy: RefferPolicy,
    sizes?:string,
    title?:string,
}

/** Link Tag
 * 
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link
 * @param {LinkInit} value
 * @returns {HTMLContent}
 */
export default function Link(value:LinkInit):HTMLElement {
    if(value.rel === undefined)
        throw new Error("Link must have a relation!");
    if(value.href === undefined)
        throw new Error("Link must have a href!");

    return "<link "+buildAttributesString(value)+"/>";
}