/** /Engine/View
 * 
 * @author Alex Malotky
 */
import {HtmlDocument, HTMLInit} from "./Html";
import Content, {toUpdate} from "./Html/Content";
import { HeadInit, HeadUpdate, mergeUpdateToInit, mergeUpdateToUpdate } from "./Html/Head";
import {AttributeList} from "./Html/Attributes";

export type RenderFunction = (update:Dictionary<Content>)=>Content;

export interface RenderUpdate {
    head?: HeadUpdate,
    body?: Dictionary<Content>,
    redirect?:string,
    update?: Dictionary<Content>,
}

export interface FetchUpdate {
    head:HeadUpdate,
    body?:Dictionary<string>,
    redirect?:string,
    update?: Dictionary<string>
}

/** View Class
 * 
 */
export default class View{
    #defaultHead:HeadInit;
    #defaultContent:RenderFunction;
    #attribute:AttributeList;

    /** Constructor
     * 
     * @param {Array<ElementTag>} headTags 
     * @param {RenderFunction} stationaryContent 
     * @param {AttributeList} attributes 
     */
    constructor(attributes:HTMLInit = {}, headInit:HeadInit = {}, stationaryContent:RenderFunction){

        if(typeof attributes !== "object")
            throw new TypeError("Invalid Attributes!");

        if(typeof headInit !== "object")
            throw new TypeError("Invalid Head Attributes");

        if(typeof stationaryContent !== "function")
            throw new TypeError("Stationary content must be in the form of a function!");

        this.#defaultContent = stationaryContent;
        this.#attribute = attributes;
        this.#defaultHead = headInit;
    }

    /** Render Content
     * 
     * @param {RenderUpdate} update 
     * @returns {string}
     */
    render(update:RenderUpdate):string{
        return HtmlDocument(this.#attribute, mergeUpdateToInit(this.#defaultHead, update.head), this.#defaultContent(update.body || {}));
    }

    /** Update Content
     * 
     * @param {RenderUpdate} update
     * @returns {FetchUpdate}
     */
    update(value:RenderUpdate):FetchUpdate {
        return {
            head: mergeUpdateToUpdate(this.#defaultHead, value.head),
            body: toUpdate(value.body),
            redirect: value.redirect,
            update: toUpdate(value.update)
        }
    }
}