/** /Engine/View/Html/Attributes/Map/Dialog
 * 
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
 * 
 * @author Alex Malotky
 */
import {GlobalAttributes} from "../Attributes";

export default interface DialogAttributes extends GlobalAttributes {
    tabindex?: undefined,
    open?: boolean
}