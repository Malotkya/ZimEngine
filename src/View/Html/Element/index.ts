/** /View/Html/Elements
 * 
 * @author Alex Malotky
 */

import { AttributeList, buildAttributesString } from "../Attributes";
import Content, {compressContent} from "../Content";

/** Element Object Interface
 * 
 * Used to represent an object 
 */
export default interface Element {
   readonly name:string,
   attributes:AttributeList,
   readonly selfClosing:boolean
   children:Array<Content>
}

export function isElement(element:any):element is Element {
   if( typeof element !== "object" || element === null)
      return false;

   if( typeof element.name !== "string" ){
      return false;
   }

   if( typeof element.attributes !== "object" ){
      return false;
   }

   if(typeof element.selfClosing !== "boolean"){
      return false;
   }

   return Array.isArray(element.children);
}

export function compileElement(element:Element):string {
   if(element === undefined || typeof element !== "object")
      throw new TypeError("Element must be an object!");

   const {name, selfClosing, attributes, children} = element;
   const attString:string = buildAttributesString(attributes);

   if(selfClosing) {
      if(children.length > 0)
         throw new Error("Self closing Element cannot have children!");

      return "<"+name+attString+"/>";
   }
      
   return "<"+name+attString+">"+compressContent(children)+"</"+name+">";
}

/** Create HTML Content
 * 
 * @param {string} name 
 * @param {Dictionary<Attribute>} attributes 
 * @param {Array<Element|Content>} children 
 * @returns {Element}
 */
export function createElement<K extends keyof HTMLClosedElementAttriburesMap>(name:K, attributes?:HTMLClosedElementAttriburesMap[K]):Element
export function createElement<K extends keyof HTMLElementAttriburesMap>(name:K, attributes?:HTMLElementAttriburesMap[K]|Content, ...children:Array<Content>):Element
export function createElement(customName:string, attributes?:AttributeList|Content, ...children:Array<Content>):Element 
export function createElement(name:string, attributes:AttributeList|Content = {}, ...children:Array<Content>):Element {
   name = name.toLocaleLowerCase();

   if(typeof attributes !== "object" || Array.isArray(attributes) || isElement(attributes) || attributes === null) {
      children.unshift(attributes);
      attributes = {};
   }

   if(name === "script" && attributes.env) {
      attributes.type = "javascript/blocked";
   }

    const selfClosing = SELF_CLOSING.indexOf(name) >= 0;

    
   return {name, selfClosing, attributes, children};
}  

import {GlobalAttributes} from "../Attributes";
import AnchorAttributes from "./Anchor";
import AreaAttributes from "./Area";
import AudioAttributes from "./Audio";
import BaseAttributes from "./Base";
import BlockQuotationAttributes from "./BlockQuotation";
import ButtonAttributes from "./Button";
import CanvasAttributes from "./Canvas";
import TableColumnAttributes from "./TableColumn";
import TableColumnGroupAttributes from "./TableColumnGroup";
import DataAttributes from "./Data";
import DeletedText from "./DeletedText";
import DetailsAttributes from "./Details";
import DialogAttributes from "./Dialog";
import EmbedExternalAttributes from "./EmbedExternal";
import FieldSetAttributes from "./FieldSet";
import FormAttributes from "./Form";
import HeadAttributes from "./Head";
import InlineFrameAttributes from "./InlineFrame";
import ImageAttributes from "./Image";
import InputAttributes from "./Input";
import InsertedTextAttributes from "./InsertedText";
import LabelAttributes from "./Label";
import ListItemAttributes from "./ListItem";
import LinkAttributes from "./Link";
import ImageMapAttributes from "./ImageMap";
import MarkTextAttributes from "./MarkText";
import MetaAttributes from "./Meta";
import MeterAttributes from "./Meter";
import ObjectAttributes from "./Object";
import OrderedListAttributes from "./OrderedList";
import OptionGroupAttributes from "./OptionGroup";
import OptionAttributes from "./Option";
import OutputAttributes from "./Output";
import ProgressAttribures from "./Progress";
import InlineQuotationAttributes from "./InlineQuotation";
import ScriptAttributes from "./Script";
import SelectAttributes from "./Select";
import SlotAttributes from "./Slot";
import StyleAttributes from "./Style";
import TableDataCellAttributes from "./TableDataCell";
import TableHeaderAttributes from "./TableHeader";
import TemplateAttributes from "./Template";
import TextAreaAttributes from "./TextArea";
import TimeAttributes from "./Time";
import TrackAttributes from "./Track";
import VideoAttributes from "./Video";


/** List of Self CLosing Attributes
 * 
 */
const SELF_CLOSING = [
   "area",
   "base",
   "br",
   "col",
   "embed",
   "hr",
   "img",
   "input",
   "link",
   "meta",
   "param",
   "source",
   "track",
   "wbr"
]

/** Closed Element Attributes Map
 * 
 */
interface HTMLClosedElementAttriburesMap {
    area: AreaAttributes,
    base: BaseAttributes,
    br: GlobalAttributes,
    col: TableColumnAttributes,
    embed: EmbedExternalAttributes,
    hr: GlobalAttributes,
    img: ImageAttributes,
    input: InputAttributes,
    link: LinkAttributes,
    meta: MetaAttributes,
    source: MediaSource,
    track: TrackAttributes,
    wbr : GlobalAttributes
}

/** Normal Element Attriutes Map
 * 
 */
interface HTMLElementAttriburesMap {
    a: AnchorAttributes,
    abbr: GlobalAttributes,
    address: GlobalAttributes,
    article: GlobalAttributes,
    aside: GlobalAttributes,
    audio: AudioAttributes,
    b: GlobalAttributes,
    bdi: GlobalAttributes,
    bdo: GlobalAttributes,
    blockquote: BlockQuotationAttributes,
    button: ButtonAttributes,
    canvas: CanvasAttributes,
    caption: GlobalAttributes
    cite: GlobalAttributes,
    code: GlobalAttributes,
    colgroup: TableColumnGroupAttributes,
    data: DataAttributes,
    datalist: GlobalAttributes,
    dd: GlobalAttributes,
    del: DeletedText,
    details: DetailsAttributes,
    dfn: GlobalAttributes,
    dialog: DialogAttributes,
    div: GlobalAttributes,
    dl: GlobalAttributes,
    dt: GlobalAttributes,
    em: GlobalAttributes,
    //fencedframe: {experimental}
    fieldset: FieldSetAttributes,
    figcaption: GlobalAttributes,
    figure: GlobalAttributes,
    footer: GlobalAttributes,
    form: FormAttributes,
    h1: GlobalAttributes,
    h2: GlobalAttributes,
    h3: GlobalAttributes,
    h4: GlobalAttributes,
    h5: GlobalAttributes,
    h6: GlobalAttributes,
    head: HeadAttributes,
    header: GlobalAttributes,
    hgroup: GlobalAttributes,
    i: GlobalAttributes,
    iframe: InlineFrameAttributes,
    ins: InsertedTextAttributes,
    kbd: GlobalAttributes,
    label: LabelAttributes,
    legend: GlobalAttributes,
    li: ListItemAttributes,
    main: GlobalAttributes,
    map: ImageMapAttributes,
    mark: MarkTextAttributes,
    menu: GlobalAttributes,
    meter: MeterAttributes,
    nav: GlobalAttributes,
    noscript: GlobalAttributes,
    object: ObjectAttributes,
    ol: OrderedListAttributes,
    optgroup: OptionGroupAttributes,
    option: OptionAttributes,
    output: OutputAttributes,
    p: GlobalAttributes,
    picture: GlobalAttributes,
    //portal: {experimental}
    pre: GlobalAttributes,
    progress: ProgressAttribures,
    q: InlineQuotationAttributes,
    rp: GlobalAttributes,
    rt: GlobalAttributes,
    ruby: GlobalAttributes,
    s: GlobalAttributes,
    samp: GlobalAttributes,
    script: ScriptAttributes,
    search: GlobalAttributes,
    section: GlobalAttributes,
    select: SelectAttributes,
    slot: SlotAttributes,
    small: GlobalAttributes,
    span: GlobalAttributes,
    strong: GlobalAttributes,
    style: StyleAttributes,
    sub: GlobalAttributes,
    summary: GlobalAttributes,
    sup: GlobalAttributes,
    table: GlobalAttributes,
    tbody: GlobalAttributes,
    td: TableDataCellAttributes,
    template: TemplateAttributes,
    textarea: TextAreaAttributes,
    tfoot: GlobalAttributes,
    th: TableHeaderAttributes,
    thead: GlobalAttributes,
    time: TimeAttributes,
    title: GlobalAttributes,
    tr: GlobalAttributes,
    u: GlobalAttributes,
    ul: GlobalAttributes,
    var: GlobalAttributes,
    video: VideoAttributes,
}