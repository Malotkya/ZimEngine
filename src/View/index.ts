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
import Layer from "../Routing/Layer";

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
export type RenderFunction = (update:Record<string, Content>)=>Content;

//Render Update Type
export interface RenderUpdate {
    head?: HeadUpdate,
    body?: Record<string, Content>,
    redirect?:string,
    update?: Record<string, Content>,
}

//Fetch Update Type
export interface FetchUpdate {
    head:HeadUpdate,
    body?:Record<string, string>,
    redirect?:string,
    update?: Record<string, string>
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
    constructor(attributes:HTMLInit = {}, headInit:HeadInit = {}, renderContent:RenderFunction = ()=>null){

        if(typeof attributes !== "object")
            throw new TypeError("Invalid Attributes!");

        if(typeof headInit !== "object")
            throw new TypeError("Invalid Head Attributes");

        if(typeof renderContent !== "function")
            throw new TypeError("Render Content must be in the form of a function!");

        this.#defaultContent = renderContent;
        this.#attribute = attributes;
        this.#defaultHead = headInit;
    }

    /** Set Up File Injection
     * 
     * @returns {Layer}
     */
    setUpInjection():Layer{
        if(this.#defaultHead.scripts === undefined)
            this.#defaultHead.scripts = [];

        let exsits:boolean = false;
        for(const scripts of this.#defaultHead.scripts){
            if(scripts.src === View.injectedFileRoute){
                exsits = true;
                break;
            }
        }

        if(!exsits) {
            this.#defaultHead.scripts.push({src: View.injectedFileRoute, defer: true});
        }

        return new Layer(View.injectFilePath, View.injectFile);
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