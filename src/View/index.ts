/** /Engine/View
 * 
 * @author Alex Malotky
 */
import {HtmlDocument, HTMLInit} from "./Html";
import Content, {toUpdate} from "./Html/Content";
import { HeadInit, HeadUpdate, mergeUpdateToInit, mergeUpdateToUpdate } from "./Html/Head";
import {AttributeList} from "./Html/Attributes";
import { nodeImport, inCloudfareWorker } from "../Util";
import MimeTypes from "../MimeTypes";
import Context from "../Context";

const { version } = require("../../package.json");

/** Get File
 * 
 * Different Implementation depending on environment.
 * 
 * @returns {string}
 */
function getFile():string {
    if(inCloudfareWorker()){
        return require("!raw-loader!./Web.js").default;
    }

    const fs = nodeImport("fs");
    const path = nodeImport("path");

    return fs.readFileSync(
        path.join(__dirname, "Web.js")
    ).toString();
}

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

    static readonly injectFilePath = "/zim.js";
    private static readonly injectedFileRoute = `/zim.js?${version}`;
    private static readonly injectedFileType = MimeTypes("js");
    private static readonly injectedFileContent = getFile()
        .replace(`Object.defineProperty(exports, "__esModule", { value: true });`, "");

    static injectFile(ctx:Context){
        ctx.response.headers.set("Content-Type", View.injectedFileType);
        ctx.write(View.injectedFileContent);
        ctx.end();
    }

    /** Constructor
     * 
     * @param {Array<ElementTag>} headTags 
     * @param {RenderFunction} stationaryContent 
     * @param {AttributeList} attributes 
     */
    constructor(attributes:HTMLInit = {}, headInit:HeadInit = {}, renderContent:RenderFunction = ()=>undefined){

        if(typeof attributes !== "object")
            throw new TypeError("Invalid Attributes!");

        if(typeof headInit !== "object")
            throw new TypeError("Invalid Head Attributes");

        if(typeof renderContent !== "function")
            throw new TypeError("Render Content must be in the form of a function!");

        if(headInit.scripts === undefined)
            headInit.scripts = [];
        headInit.scripts.push({src: View.injectedFileRoute, defer: true});

        this.#defaultContent = renderContent;
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