/** /View
 * 
 * @author Alex Malotky
 */
import HtmlDocument, {Content, createElement, compressContent} from "./Html";
export {Content, createElement};
import Context from "../Context";
import fs from "fs";
import path from "path";
import MimeTypes from "../MimeTypes";
import { dictionaryInclude } from "../Util";

/** Content Update Interface
 * 
 */
export interface ContentUpdate{
    content?:Content,
    header: {
        update: Dictionary<string>,
        delete: Array<string>
    }
}

export interface RenderUpdate {
    content?:Content,
    header?: Dictionary<string>
}

/** Render Content Function
 * 
 * Used to determin where content will be rendered on partial render.
 */
export type RenderContent = (update:Content)=>Content;

/** Element Tag Interface
 * 
 */
export interface ElementTag {
    name:string,
    attributes?:Dictionary<string>,
    content?:string
    self?:boolean
}

/** Generate Head Object
 * 
 * @param {Array<ElementTag>} tags 
 * @returns {Dictionary<string>}
 */
function generateHeadObject(tags:Array<ElementTag>):Dictionary<ElementTag>{
    let output:Dictionary<ElementTag> = {};
     
    let id:number = 0;
    for(let tag of tags){
        switch (tag.name.toLowerCase()){
            case "base":
                if(output["base"] !== undefined) {
                    throw new Error("Multiple Base tags were given!")
                }
                if(tag.content){
                    tag.attributes = {href: tag.content}
                    delete tag.content;
                }
                tag.self = true;
                output["base"] = tag;
                break;

            case "title":
                if(output["title"] !== undefined){
                    throw new Error("Multiple Title tags were given!")
                }
                output["title"] = tag;
                break;

            case "charset":
                if(output['charset'] !== undefined){
                    throw new Error("Multiple charset tags where given!");
                }
                if(tag.content)
                    tag.attributes = {charset: tag.content};
                delete tag.content;
                tag.name = "meta";
                tag.self = true;
                output["charset"] = tag;
                break;

            case "style":
            case "script":
                output[id] = tag;
                break;
                
            case "link":
                tag.attributes = tag.attributes || {};
                if(tag.attributes.href === undefined)
                    tag.attributes.href = String(tag.content);
                delete tag.content;
                tag.self = true;
                output[id] = tag;
                break;
                
            case "meta":
                if(tag.attributes) {
                    tag.name = tag.attributes["name"] || "name";
                    tag.content = tag.attributes["content"] || "blank";
                } else {
                    break;
                }
            default:
                const name = tag.name.toLowerCase()
                if(output[name] !== undefined) {
                    throw new Error(`Multiple Meta tags with name '${tag.name}' were given!`)
                }
                output[name] = {
                    name:"meta",
                    attributes: {name:tag.name, content: String(tag.content)},
                    self: true
                };
        }
        id++;
    }

    return output;
}

function combineHeadElements(original:Dictionary<ElementTag>, update:Dictionary<string> = {}):Dictionary<ElementTag> {
    const output:Dictionary<ElementTag> = JSON.parse(JSON.stringify(original));

    for(let name in update){
        name = name.toLowerCase();
        //If Updating!
        if(typeof output[name] !== "undefined"){
            switch (name){
                case "base":
                    //@ts-ignore
                    output[name].attributes["href"] = update[name];
                    break;

                case "title":
                    //@ts-ignore
                    output[name].content = update[name];
                    break;

                case "charset":
                    //@ts-ignore
                    output[name].attributes["charset"] = update[name];
                    break;

                case "link":
                case "style":
                case "script":
                case "meta":
                    throw new Error("Unable to update with name: " + name);
                    break;
                
                //Meta Tag Updates
                default:
                    //@ts-ignore
                    output[name].attributes["content"] = update[name];
                    break;
            }
        } else {
            switch (name){
                case "base":
                case "link":
                    output[name] = {
                        name: name,
                        attributes: {
                            href: update[name]
                        }
                    }
                    break;

                case "script":
                    output[name] = {
                        name: name,
                        attributes: {
                            src: update[name]
                        }
                    }
                    break;

                case "charset":
                    output[name] = {
                        name: name,
                        attributes: { 
                            charset: update[name]
                        },
                        self: true
                    }
                    break;

                case "title":
                case "style":
                    output[name] = {
                        name: name,
                        content: update[name]
                    }
                    break;
                
                case "meta":
                    throw new Error("Unable to create meta with name: " + name);
                default:
                    output[name] = {
                        name: name,
                        attributes: {
                            content: update[name]
                        }
                    }
            }
        }//End_If
    }

    return output;
}

function updateHeadElements(current:Dictionary<ElementTag>, update:Dictionary<string>|undefined, defaults:Dictionary<ElementTag>):[Dictionary<ElementTag>, Array<string>]{
    const output:Dictionary<ElementTag> = {};
    const remove:Array<string> = [];

    update = update || {};

    for(let name in current){
        if(!dictionaryInclude(update, name)) {
            if(dictionaryInclude(defaults, name)){
                output[name] = JSON.parse(JSON.stringify(defaults[name]));
            } else {
                remove.push(name);
            }
            
        }
    }

    for(let name in update){
        switch (name){
            case "base":
            case "link":
                output[name] = {
                    name: name,
                    attributes: {
                        href: update[name]
                    }
                }
                break;
    
            case "script":
                output[name] = {
                    name: name,
                    attributes: {
                        src: update[name]
                    }
                }
                break;
    
            case "charset":
                output[name] = {
                    name: name,
                    attributes: { 
                        charset: update[name]
                    },
                    self: true
                }
                break;
    
            case "title":
            case "style":
                output[name] = {
                    name: name,
                    content: update[name]
                }
                break;
                
            case "meta":
                throw new Error("Unable to create meta with name: " + name);
            default:
                output[name] = {
                    name: name,
                    attributes: {
                        content: update["name"]
                    }
                }
        }
    }

    return [output, remove];
}

function convertElementDictionaryToStringDictionary(input:Dictionary<ElementTag>):Dictionary<string>{
    const output:Dictionary<string> = {};

    for(let name in input){
        switch (name.toLowerCase()){
            case "base":
            case "link":
                //@ts-ignore
                output[name] = input[name].attributes.href;
                break;
    
            case "script":
                //@ts-ignore
                output[name] = input[name].attributes.src;
                break;
    
            case "charset":
                //@ts-ignore
                output[name] = input[name].attributes.charset
                break;

            case "title":
            case "style":
                //@ts-ignore
                output[name] = input[name].content
                break;
                
            case "meta":
                throw new Error("Unable to create meta with name: " + name);
            default:
                //@ts-ignore
                output[name] = input[name].attributes.content;
        }
    }

    return output;
}

/** Injected File Information.
 * 
 */
const fileHeader:string = MimeTypes("js");
const fileContent:string = fs.readFileSync(path.join(__dirname, "web.js")).toString().replace('Object.defineProperty(exports, "__esModule", { value: true });', '');

/** View Class
 * 
 */
export default class View{
    #defaultHead:Dictionary<ElementTag>;
    #defaultContent:RenderContent;
    #attribute:Dictionary<string>;
    #currentHead:Dictionary<ElementTag>;

    /** Constructor
     * 
     * @param {Array<ElementTag>} headTags 
     * @param {RenderContent} stationaryContent 
     * @param {Dictionary<string>} attributes 
     */
    constructor(headTags:Array<ElementTag> = [], stationaryContent:RenderContent = compressContent, attributes:Dictionary<string> = {}){
        if(!Array.isArray(headTags))
            throw new TypeError("Head Tags must be in an array!");

        if(typeof stationaryContent !== "function")
            throw new TypeError("Stationary content must be in the form of a function!");

        if(typeof attributes !== "object")
            throw new TypeError("Attributes bust be stored in an object!");

        this.#defaultContent = stationaryContent;
        this.#attribute = attributes;
        this.#defaultHead = generateHeadObject(headTags);
        this.#currentHead = {};
        this.#defaultHead["injectedJS"] = {name: "script", attributes:{src:View.route, defer:""}};
    }

    /** File Route Getter
     * 
     */
    static get route():string {
        return "/zim.js"
    }

    /** Get File Name Handler
     * 
     * @param {Context} ctx 
     */
    static getFile(ctx:Context):void {
        ctx.response.setHeader("Content-Type", fileHeader);
        ctx.response.write(fileContent);
    }

    /** Render Content Update
     * 
     * @param {ContentUpdate} update 
     * @returns {string}
     */
    render(update:RenderUpdate):string{
        this.#currentHead = combineHeadElements(this.#defaultHead, update.header);
        return HtmlDocument(
            this.#attribute,
            Object.values(this.#currentHead).map(value=>createElement(value.name, value.attributes, value.self, value.content || null)).join(""),
            this.#defaultContent(update.content)
            );
    }

    update(update:RenderUpdate):ContentUpdate{
        const [newHeader, deleteHeader] = updateHeadElements(this.#currentHead, update.header, this.#defaultHead);
        this.#currentHead = newHeader;
        return {
            content: update.content || "",
            header: {
                update: convertElementDictionaryToStringDictionary(newHeader),
                delete: deleteHeader
            }
        }
    }
}