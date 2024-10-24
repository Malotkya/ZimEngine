import {buildAttributesString} from "./Attributes";
import HTMLAttributes from "./Element/Html";
import { createElement } from "./Element";
import Content, {compressContent} from "./Content";
import Head, {HeadInit} from "./Head"

type HTMLElement = string;
export default HTMLElement;
export type HTMLInit = HTMLAttributes;

export {createElement, compressContent};

function html(init:HTMLInit, head:HTMLElement, body:HTMLElement):HTMLElement {
    return "<html "+buildAttributesString(init)+">"+head+body+"</html>";
}

/**
 * 
 * @param children 
 * @returns 
 */
function body(children:Array<Content>|Content):HTMLElement {
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

