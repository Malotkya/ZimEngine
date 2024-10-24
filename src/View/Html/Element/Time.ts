/** /Engine/View/Html/Attributes/Map/Time
* 
* https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time
* 
* @author Alex Malotky
*/
import {GlobalAttributes} from "../Attributes";

export default interface TimeAttributes extends GlobalAttributes {
    datetime: Date|string
}