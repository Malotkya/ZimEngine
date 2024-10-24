/** /Engine/View/HTML/Attributes/Map
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

import AnchorAttributes from "./Anchor";
import AbbreviationAttributes from "./Abbreviation";
import AddressAttributes from "./Address";
import AreaAttributes from "./Area";
import ArticleAttributes from "./Article";
import AsideAttributes from "./Aside";
import AudioAttributes from "./Audio";
import BoldAttributes from "./Bold";
import BaseAttributes from "./Base";
import BidirectionIsolateAttributes from "./BidirectionalIsolate";
import BidirectionalOverrideAttributes from "./BidirectionlOverride";
import BlockQuotationAttributes from "./BlockQuotation";
import LineBreakAttributes from "./LineBreak";
import ButtonAttributes from "./Button";
import CanvasAttributes from "./Canvas";
import CaptionAttributes from "./Caption";
import CiteAttributes from "./Cite";
import CodeAttributes from "./Code";
import TableColumnAttributes from "./TableColumn";
import TableColumnGroupAttributes from "./TableColumnGroup";
import DataAttributes from "./Data";
import DataListAttributes from "./DataList";
import DescriptionDetailsAttributes from "./DescriptionDetails";
import DeletedText from "./DeletedText";
import DetailsAttributes from "./Details";
import DefinitionAttributes from "./Definition";
import DialogAttributes from "./Dialog";
import DivisionAttributes from "./Division";
import DescriptionListAttributes from "./DescriptionList";
import DescriptionTermAttributes from "./DescriptionTerm";
import EmphasisAttributes from "./Emphasis";
import EmbedExternalAttributes from "./EmbedExternal";
import FieldSetAttributes from "./FieldSet";
import FigureCaptionAttributes from "./FigureCaption";
import FigureAttributes from "./Figure";
import FooterAttributes from "./Footer";
import FormAttributes from "./Form";
import SectionHeadingAttributes from "./SectionHeading";
import HeadAttributes from "./Head";
import HeaderAttributes from "./Header";
import HeadingGroupAttributes from "./HeadingGroup";
import HorizontalRuleAttributes from "./HorizontalRule";
import IdiomaticAttributes from "./Idiomatic";
import InlineFrameAttributes from "./InlineFrame";
import ImageAttributes from "./Image";
import InputAttributes from "./Input";
import InsertedTextAttributes from "./InsertedText";
import KeyBoardInputAttributes from "./KeyBoardInput";
import LabelAttributes from "./Label";
import FieldSetLegendAttributes from "./FieldSetLegend";
import ListItemAttributes from "./ListItem";
import LinkAttributes from "./Link";
import MainAttributes from "./Main";
import ImageMapAttributes from "./ImageMap";
import MarkTextAttributes from "./MarkText";
import MenuAttributes from "./Menu";
import MetaAttributes from "./Meta";
import MeterAttributes from "./Meter";
import NavigationAttributes from "./Navigation";
import NoScriptAttributes from "./Noscript";
import ObjectAttributes from "./Object";
import OrderedListAttributes from "./OrderedList";
import OptionGroupAttributes from "./OptionGroup";
import OptionAttributes from "./Option";
import OutputAttributes from "./Output";
import ParagraphAttributes from "./Paragraph";
import PictureAttributes from "./Picture";
import PreformatedTextAttributes from "./PreformattedText";
import ProgressAttribures from "./Progress";
import InlineQuotationAttributes from "./InlineQuotation";
import RubyAttributes from "./Ruby";
import StrikthroughAttributes from "./Strikthrough";
import SampleOutputAttributes from "./SampleOuput";
import ScriptAttributes from "./Script";
import SearchAttributes from "./Search";
import SectionAttributes from "./Section";
import SelectAttributes from "./Select";
import SlotAttributes from "./Slot";
import SmallAttributes from "./Small";
import SpanAttributes from "./Span";
import StrongAttributes from "./Strong";
import StyleAttributes from "./Style";
import SubscriptAttributes from "./Subscript";
import SummaryAttributes from "./Summary";
import SuperscriptAttributes from "./Superscript";
import TableAttributes from "./Table";
import TableBodyAttributes from "./TableBody";
import TableDataCellAttributes from "./TableDataCell";
import TableFootAttributes from "./TableFoot";
import TableHeadAttributes from "./TableHead";
import TableHeaderAttributes from "./TableHeader";
import TableRowAttributes from "./TableRow";
import TemplateAttributes from "./Template";
import TextAreaAttributes from "./TextArea";
import TimeAttributes from "./Time";
import TitleAttributes from "./Title";
import TrackAttributes from "./Track";
import UnderlineAttributes from "./Underline";
import UnorderedListAttributes from "./UnorderedList";
import VariableAttributes from "./Variable";
import VideoAttributes from "./Video";
import LineBreakOppertunityAttributes from "./LineBreakOpportunity";

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
    br: LineBreakAttributes,
    col: TableColumnAttributes,
    embed: EmbedExternalAttributes,
    hr: HorizontalRuleAttributes,
    img: ImageAttributes,
    input: InputAttributes,
    link: LinkAttributes,
    meta: MetaAttributes,
 /* param: {depretiated} */
    source: MediaSource,
    track: TrackAttributes,
    wbr : LineBreakOppertunityAttributes
}

/** Normal Element Attriutes Map
 * 
 */
interface HTMLElementAttriburesMap {
    a: AnchorAttributes,
    abbr: AbbreviationAttributes,
 /* acronym: {depretiated} */
    address: AddressAttributes,
    article: ArticleAttributes,
    aside: AsideAttributes,
    audio: AudioAttributes,
    b: BoldAttributes,
    bdi: BidirectionIsolateAttributes,
    bdo: BidirectionalOverrideAttributes,
 /* big: {depretiated} */
    blockquote: BlockQuotationAttributes,
    button: ButtonAttributes,
    canvas: CanvasAttributes,
    caption: CaptionAttributes
 /* center: {depretiated} */
    cite: CiteAttributes,
    code: CodeAttributes,
    colgroup: TableColumnGroupAttributes,
    data: DataAttributes,
    datalist: DataListAttributes,
    dd: DescriptionDetailsAttributes,
    del: DeletedText,
    details: DetailsAttributes,
    dfn: DefinitionAttributes,
    dialog: DialogAttributes,
 /* dir: {depretiated} */
    div: DivisionAttributes,
    dl: DescriptionListAttributes,
    dt: DescriptionTermAttributes,
    em: EmphasisAttributes,
    //fencedframe: {experimental}
    fieldset: FieldSetAttributes,
    figcaption: FigureCaptionAttributes,
    figure: FigureAttributes,
 /* font: {depretiated} */
    footer: FooterAttributes,
    form: FormAttributes,
 /* frame: {depretiated} */
 /* frameset: {depretiated} */
    h1: SectionHeadingAttributes,
    h2: SectionHeadingAttributes,
    h3: SectionHeadingAttributes,
    h4: SectionHeadingAttributes,
    h5: SectionHeadingAttributes,
    h6: SectionHeadingAttributes,
    head: HeadAttributes,
    header: HeaderAttributes,
    hgroup: HeadingGroupAttributes,
    i: IdiomaticAttributes,
    iframe: InlineFrameAttributes,
    ins: InsertedTextAttributes,
    kbd: KeyBoardInputAttributes,
    label: LabelAttributes,
    legend: FieldSetLegendAttributes,
    li: ListItemAttributes,
    main: MainAttributes,
    map: ImageMapAttributes,
    mark: MarkTextAttributes,
 /* marquee: {depretiated} */
    menu: MenuAttributes,
    meter: MeterAttributes,
    nav: NavigationAttributes,
 /* nobr: {depretiated} */
 /* noembed: {depretiated} */
 /* noframes: {depretiated} */
    noscript: NoScriptAttributes,
    object: ObjectAttributes,
    ol: OrderedListAttributes,
    optgroup: OptionGroupAttributes,
    option: OptionAttributes,
    output: OutputAttributes,
    p: ParagraphAttributes,
    picture: PictureAttributes,
    /* plaintext: {depretiated} */
    //portal: {experimental}
    pre: PreformatedTextAttributes,
    progress: ProgressAttribures,
    q: InlineQuotationAttributes,
 /* rb: {depretiated} */
    rp: RubyAttributes,
    rt: RubyAttributes,
 /* rtc: {depretiated} */
    ruby: RubyAttributes,
    s: StrikthroughAttributes,
    samp: SampleOutputAttributes,
    script: ScriptAttributes,
    search: SearchAttributes,
    section: SectionAttributes,
    select: SelectAttributes,
    slot: SlotAttributes,
    small: SmallAttributes,
    span: SpanAttributes,
 /* strike: {depretiated} */
    strong: StrongAttributes,
    style: StyleAttributes,
    sub: SubscriptAttributes,
    summary: SummaryAttributes,
    sup: SuperscriptAttributes,
    table: TableAttributes,
    tbody: TableBodyAttributes,
    td: TableDataCellAttributes,
    template: TemplateAttributes,
    textarea: TextAreaAttributes,
    tfoot: TableFootAttributes,
    th: TableHeaderAttributes,
    thead: TableHeadAttributes,
    time: TimeAttributes,
    title: TitleAttributes,
    tr: TableRowAttributes,
 /* tt: {depretiated} */
    u: UnderlineAttributes,
    ul: UnorderedListAttributes,
    var: VariableAttributes,
    video: VideoAttributes,
 /* xmp: {depretiated} */
}