/** /Engine/View/Html/Attributes/Map/InsertedText
 * 
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ins
 * 
 * @author Alex Malotky
 */
import {GlobalAttributes, SpaceSeperatedList, Target} from "../Attributes";

export default interface InsertedTextAttributes extends GlobalAttributes {
    cite?: string,
    datetime?: string|Date
}