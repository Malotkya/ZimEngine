/** /Engine/View/Html/Attributes/Map/FieldSet
 * 
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset
 * 
 * @author Alex Malotky
 */
import {GlobalAttributes} from "../Attributes";

export default interface FieldSetAttributes extends GlobalAttributes {
    disabled?: boolean,
    form?: string,
    name?: string,
}