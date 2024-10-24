/** /Engine/View/HTML/Attributes
 * 
 */
import AriaGlobalAttributes, {toString as toAriaString} from "./Aria";
import {toString as functionToString} from "../Function";

type Attribute = string|number|boolean|Array<string>|Date|EventListener;
export default Attribute;
export type AttributeList = Dictionary<Attribute|undefined>;

//HTML Values used accross Elements
export type RefferPolicy = "no-referrer"|"no-referrer-when-downgrade"|"origin"|"origin-when-cross-origin"|"unsafe-url";
export type CrossOrigin = "anonymous"|"use-credentials";
export type Priority = "high"|"low"|"auto";

export type Target = "_self"|"_blank"|"_parent"|"_top";
export type SpaceSeperatedList = string|string[];
export type Enumerable = "true"|"false";
export type Value = number|string;

/** Build Attributes String
 * 
 * Helper function that converts an Attribute or Init into a string.
 * 
 * @param {Dictionary<Attribute>} attributes 
 * @returns {stirng}
 */
export function buildAttributesString(attributes:AttributeList):string {
    let output:string = "";
    for(let raw in attributes){
        const name = convertName(raw);
        const value = attributes[raw];

        if(name.indexOf("aria") >= 0){
            output += toAriaString(name, value);
        } else {
            output += toString(name, value);
        }
    }
    return output;
}

/** Attribute To String
 * 
 * @param name 
 * @param value 
 */
export function toString(name:string, value:Attribute|undefined):string {
    switch (typeof value){
        case "function":
            value = functionToString(value);

        case "string":
            if(value !== "")
                return " "+name+"=\""+value.replaceAll('"', "&quot;")+"\"";
            return "";

        case "number":
            if(!isNaN(value))
                return " "+name+"=\""+value+"\"";
            console.warn("NaN passed as Attribute value!");
            return name+"=\"NaN\" ";

        case "boolean":
            return " "+name;

        case "undefined":
            return "";

        case "object":
            if(Array.isArray(value)){
                return " "+name+"=\""+value.join(" ")+"\""

            } else if(value instanceof Date){
                return " "+name+"=\""+value.toDateString()+"\"";
            } else if(value === null){
                return " "+name+"=\"\""
            }

        default:
            console.warn("Unknown value passed as Attribute:\n%o", value);
            return " "+name+"=\""+String(value)+"\"";
    }
}

/** Convert Attribute Name
 * 
 * converts camel case names to dash/kebab case.
 * 
 * @param {string} name 
 * @returns {string}
 */
export function convertName(name:string):string {
    return name.replaceAll(/([A-Z])/g, ("-$1")).toLocaleLowerCase();
}

//https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
export interface GlobalAttributes extends AriaGlobalAttributes {
    accesskey?:string,
    autocapitalize?: "none"|"off"|"sentences"|"on"|"words"|"characters",
    autofocus?:boolean,
    class?:SpaceSeperatedList,
    contenteditable?:Enumerable|"plaintext-only",
    /* data-*?: any */
    dir?: "ltr"|"rtl"|"auto",
    draggable?: Enumerable,
    enterkeyhint?: "enter"|"done"|"go"|"next"|"previous"|"search"|"send",
    exportparts?:SpaceSeperatedList,
    hidden?: boolean|"until-found",
    id?: string,
    inert?: boolean,
    inputmode?: "none"|"text"|"decimal"|"numeric"|"tel"|"search"|"email"|"url",
    is?: string,
    itemid?: string,
    itemprop?: string,
    itemref?: string,
    itemscope?: string,
    itemtype?: string,
    lang?: string,
    nonce?: string,
    part?: SpaceSeperatedList,
    popover?: boolean,
    role?: "toolbar"|"tooltip"|"feed"|"math"|"presentation"|"note"|"scrollbar"|"searchbox"|"separator"|"slider"|"spinbutton"|"switch"|"tab"|"tabpanel"|"treeitem"|"combobox"|"menu"|"menubar"|"tablist"|"tree"|"treegrid",
    slot?: string,
    spellcheck?: boolean,
    style?: string, /*Style Array??*/
    tabindex?: number,
    title?: string,
    translate?: "yes"|"no",
    //virtualkeyboardpolicy?: "auto"|"manual",
}