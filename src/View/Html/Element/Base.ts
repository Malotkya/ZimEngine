/** /Engine/View/Html/Attributes/Map/Base
 * 
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base
 * 
 * @author Alex Malotky
 */
import { AttributeList, Target } from "../Attributes";

export default interface BaseAttributes extends AttributeList{
    href?:string,
    target?:Target
}