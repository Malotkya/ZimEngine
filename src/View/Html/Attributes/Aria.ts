/** Aria Accessibility Attributes
 * 
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes
 */
import {AttributeList, SpaceSeperatedList} from ".";

/* Widget Region Attributes */
export type Autocomplete = "none"|"inline"|"list"|"both";
export type Checked = boolean;
export type Disabled = boolean;
export type Errormessage = string;
export type Expanded = boolean;
export type Haspopup = "menu"|"listbox"|"tree"|"grid"|"dialog"|boolean;
export type Hidden = boolean;
export type Invalid = boolean;
export type Modal = boolean;
export type Multiline = boolean;
export type Multilineselectable = boolean;
export type Orientation = "horizontal"|"vertical";
export type Placeholder = string;
export type Pressed = "mixed"|boolean;
export type Readonly = boolean;
export type Required = boolean;
export type Selected = boolean;
export type Sort = "ascending"|"descending"|"other"|"none";
export type Valuemax = number;
export type Valuemin = number;
export type Valuenow = number;
export type Valuetext = string;

/* Live Region Attributes */
export type Busy = boolean;
export type Live = "assertive"|"polite"|"off";
export type Relevant ="additions"|"all"|"removals"|"text"|"addions text";
export type Atomic = boolean;

/* Drag and Drop Attributes */
export type Dropeffect = "copy"|"execute"|"link"|"move"|"popup";
export type Grabbed = boolean;

/* Relationship Attributes */
export type Activedescendant = string;
export type Colcount = number;
export type Colindex = number;
export type Colspan = number;
export type Controls = string;
export type Describedby = SpaceSeperatedList;
export type Description = string;
export type Details = string;
export type Flowto = string;
export type Labelledby = SpaceSeperatedList;
export type Owns = SpaceSeperatedList;
export type Posinset = number;
export type Rowcount = number;
export type Rowindex = number;
export type Rowspan = number;
export type Setsize = number

/* Global Attributes */
export type Current = "page"|"step"|"location"|"date"|"time"|boolean;
export type Keyshortcuts = string;
export type Label = string;
export type Roledescription = string;

/** Aria Global Attributes
 * 
 */
export default interface GlobalAttributes extends AttributeList{
    ariaAtomic?: Atomic,
    ariaBusy?: Busy,
    ariaControls?: Controls,
    ariaCurrent?: Current,
    ariaDesribedby?: Describedby,
    ariaDescription?: Description,
    ariaDetails?: Details,
    ariaDesabled?: Disabled,
    ariaDropeffect?: Dropeffect,
    ariaErrormessage?: Errormessage,
    ariaFlowto?: Flowto,
    airaGrabbed?: Grabbed,
    ariaHaspopup?: Haspopup,
    ariaHidden?: Hidden,
    ariaInvalid?: Invalid,
    ariaKeyshrotcuts?: Keyshortcuts,
    ariaLabel?: Label,
    ariaLabelledby?: Labelledby,
    ariaLive?: Live,
    ariaOwns?: Owns,
    ariaRelevant?: Relevant,
    ariaRoledescription?: Roledescription
}

/** Aria Attribute To String
 * 
 * @param {string} name 
 * @param {unknown} value 
 * @returns {string}
 */
export function toString(name:string, value:unknown):string {
    switch (typeof value) {
        case "string":
            if(value !== "")
                return " "+name+"=\""+value+"\"";
            break;

        case "number":
            if(!isNaN(value))
                return " "+name+"=\""+value+"\"";
            else
                console.warn("NaN passed as Aria Attribute value!");
            break;

        case "boolean":
            return " "+name+"=\""+(value?"true":"false")+"\"";

        case "undefined":
            return "";

        case "object":
            if(Array.isArray(value)) {
                return " "+name+"=\""+value.join(" ")+"\"";
            }

        default:
            console.warn("Unknown value passed as Aria Attribute:\n%o", value);
    }   

    return "";
}