/** /Engine/View/Html/Attributes/Map/MediaSource
* 
* https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source
* 
* @author Alex Malotky
*/
import {GlobalAttributes} from "../Attributes";

export default interface MediaSourceAttributes extends GlobalAttributes {
    type?: string,
    src?: string,
    srcset?: string,
    sizes?: string,
    media?: string,
    height?: number,
    width?: number
}