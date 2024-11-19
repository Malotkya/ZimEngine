/** /View/Html
 * 
 * @author Alex Malotky
 */
import {buildAttributesString} from "./Attributes";
import HTMLAttributes from "./Element/Html";
import { createElement } from "./Element";
import Content, {compressContent} from "./Content";
import Head, {HeadInit} from "./Head"

// HTMLElement Type
type HTMLElement = string;
export default HTMLElement;

// HTMLInit Type
export type HTMLInit = HTMLAttributes;

// Export Types
export {createElement, compressContent};

/** Html Element
 * 
 * @param {HTMLInit} init 
 * @param {HTMLElement} head
 * @param {HTMLElement} body
 * @returns {HTMLElement}
 */
function html(init:HTMLInit, head:HTMLElement, body:HTMLElement):HTMLElement {
    return "<html"+buildAttributesString(init)+">"+head+body+"</html>";
}

/** Html Body Element
 * 
 * @param {Content} children 
 * @returns {HTMLElement}
 */
function body(children:Content):HTMLElement {
    return "<body>"+compressContent(children)+"</body>";
}

/** Generate HTML Document
 * 
 * @param {Dictionary<string>} att 
 * @param {string} head 
 * @param {Array<Element|Content>} content 
 * @returns {string}
 */
export function HtmlDocument(att:HTMLInit, head:HeadInit, content:Array<Content>|Content):HTMLElement{
    return "<!DOCTYPE html>"+html(att, Head(head), body(content));
}

