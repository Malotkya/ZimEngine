/** /View/Html
 * 
 * @author Alex Malotky
 */

/** Types of Content
 * 
 */
export type Content = string|Array<Content>|null|undefined;

/** Generate HTML Document
 * 
 * @param {Dictionary<string>} att 
 * @param {string} head 
 * @param {string} body 
 * @returns {string}
 */
export default function HtmlDocument(att:Dictionary<string>, head:string, body:Content):string{
    return "<!DOCTYPE html>"+
        createElement("html", att, 
            createElement("head", head),
            createElement("body", body)
        );
}

/** Create HTML Element
 * 
 * @param {string} name 
 * @param {Dictionary<string>} attributes 
 * @param {boolean} selfClosing
 * @param {Array<Content>} children 
 * @returns {string}
 */
export function createElement(name:string, attributes:Dictionary<string>|Content = {}, selfClosing?:boolean|Content, ...children:Array<Content>):string {
    
    if(typeof selfClosing !== "boolean" && typeof selfClosing !== "undefined") {
        children.unshift(selfClosing);
        selfClosing = false;
    }

    if(typeof attributes === "boolean") {
        selfClosing = children.length === 0; //Overrides/sets false if children.
        attributes = {};
    }else if(typeof attributes !== "object" || Array.isArray(attributes)){
        children.unshift(attributes);
        selfClosing = false; //If you add children, can't be self closing.
        attributes = {};
    }

    let attString:string = "";
    for(let name in attributes)
        attString += " "+name+"='"+attributes[name]+"'";

    if(selfClosing) {
        return "<"+name+attString+"/>";
    }
    
    return "<"+name+attString+">"+compressContent(children)+"</"+name+">";
}

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
    }
    return String(content);
}