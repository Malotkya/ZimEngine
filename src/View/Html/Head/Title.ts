/** /Engine/View/Html/Head/Title
 * 
 * @author Alex Malotky
 */
import HTMLElement from "..";

export type TitleInit = string;
export type TitleUpdate = string;

/** Title Tag
 * 
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title
 * @param {TitleInit} value 
 * @returns {HTMLContent}
 */
export default function Title(value:TitleInit):HTMLElement {
    return "<title>"+value+"</title>";
}

/** Update Title
 * 
 */
export function updateTitle(init:TitleInit = "", update:TitleUpdate = ""):TitleUpdate {
    if(init){
        if(update)
            return init+" | "+update;
        return init;
    }

    return update;
}