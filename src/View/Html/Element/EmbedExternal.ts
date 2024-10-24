/** /Engine/View/Html/Attributes/Map/Emphasis
 * 
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/em
 * 
 * @author Alex Malotky
 */
import {GlobalAttributes} from "../Attributes";

export default interface EmbedExternalAttributes extends GlobalAttributes {
    height?: number,
    src?: string,
    type?: string,
    width?: number
}