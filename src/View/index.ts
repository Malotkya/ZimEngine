/** /View
 * 
 * @author Alex Malotky
 */
import HtmlDocument, {Content, createElement, compressContent} from "./Html";
export {Content, createElement};

/** Content Update Interface
 * 
 */
export interface ContentUpdate{
    content:Content,
    head:Dictionary<string>
}

/** Render Content Function
 * 
 * Used to determin where content will be rendered on partial render.
 */
export type RenderContent = (update:Content)=>string;

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

            case "style":
            case "script":
                output[id] = tag;
                break;
                
            case "link":
                tag.attributes = tag.attributes || {};
                if(tag.attributes.href === undefined)
                    tag.attributes.href = tag.content;
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
                    attributes: {name:tag.name, content: tag.content},
                    self: true
                };
        }
        id++;
    }

    return output;
}

function generateHeadElement(original:Dictionary<ElementTag>, update:Dictionary<string>):string {
    original = Object.assign({}, original);
    for(let name in update){
        name = name.toLowerCase();
        //If Updating!
        if(typeof original[name] !== "undefined"){
            switch (name){
                case "base":
                    //@ts-ignore
                    original[name].attributes["href"] = update[name];
                    break;

                case "title":
                    //@ts-ignore
                    original[name].content = update[name];
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
                    original[name].attributes["content"] = update[name];
                    break;
            }
        } else {
            switch (name){
                case "base":
                case "script":
                case "link":
                    original[name] = {
                        name: name,
                        attributes: {
                            href: update["name"]
                        }
                    }
                    break;

                case "title":
                case "style":
                    original[name] = {
                        name: name,
                        content: update["name"]
                    }
                    break;
                
                case "meta":
                    throw new Error("Unable to create meta with name: " + name);
                default:
                    original[name] = {
                        name: name,
                        attributes: {
                            content: update["name"]
                        }
                    }
            }
        }//End_If
    }

    return Object.values(original).map(value=>value?createElement(value.name, value.attributes, value.self, value.content || null): "").join("");
}

/** View Class
 * 
 */
export default class View{
    #defaultHead:Dictionary<ElementTag>;
    #defaultContent:RenderContent;
    #attribute:Dictionary<string>

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
        this.#defaultHead["injectedJS"] = {name: "script", attributes:{href:"./zim.js", defer:""}};
    }

    /** Render Content Update
     * 
     * @param {ContentUpdate} update 
     * @returns {string}
     */
    render(update:ContentUpdate):string{
        const head:string = generateHeadElement(this.#defaultHead, update.head);
        const body:string = this.#defaultContent(update.content);
        return HtmlDocument(this.#attribute, head, body);
    }
}