/** /Engine/View/Html/Attributes/Map/InlineFrame
 * 
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
 * 
 * @author Alex Malotky
 */
import {GlobalAttributes, RefferPolicy} from "../Attributes";

export default interface InlineFrameAttributes extends GlobalAttributes {
    allow?:string,
    allowfullscreen?:boolean,
    height?: number,
    loading?:"eager"|"lazy",
    name?:string,
    referrerpolicy?: RefferPolicy,
    sandbox?: "allow-downloads"|"allow-forms"|"allow-modals"|"allow-orientation-lock"|"allow-pointer-lock"|"allow-popups"|"allow-popups-to-escape-sandbox"|"allow-presentation"|"allow-scripts"|"allow-storage0access-by-user-activation"|"allow-top-navigation"|"allow-top-navigation-to-custom-protocols",
    src?: string,
    srcdoc?: string,
    width?: number
}