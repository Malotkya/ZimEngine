/** /View
 * 
 * @author Alex Malotky
 */
import {HtmlDocument, HTMLInit} from "./Html";
import Content, {toUpdate} from "./Html/Content";
import { HeadInit, HeadUpdate, mergeUpdateToInit, mergeUpdateToUpdate } from "./Html/Head";
import {AttributeList} from "./Html/Attributes";
import { inCloudfareWorker } from "../Util";
import { nodeImport } from "../Node";
import MimeTypes from "../MimeTypes";
import Context from "../Context";

const { version } = require("../../package.json");

/** Get Web File
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

//Render Function Type
export type RenderFunction = (update:Dictionary<Content>)=>Content;

//Render Update Type
export interface RenderUpdate {
    head?: HeadUpdate,
    body?: Dictionary<Content>,
    redirect?:string,
    update?: Dictionary<Content>,
}

//Fetch Update Type
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
    private static readonly injectedFileContent = getFile();

    /** Inject Web File
     * 
     * @param {Context} ctx 
     */
    static injectFile(ctx:Context){
        ctx.response.headers.set("Content-Type", View.injectedFileType);
        ctx.write(View.injectedFileContent);
        ctx.end();
    }

    /** Constructor
     * 
     * @param {HTMLInit} attributes 
     * @param {HeadInit} headInit 
     * @param {RenderFunction} renderContent 
     */
    constructor(attributes:HTMLInit = {}, headInit:HeadInit = {}, renderContent:RenderFunction){

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