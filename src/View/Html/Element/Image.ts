/** /Engine/View/Html/Attributes/Map/Image
 * 
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
 * 
 * @author Alex Malotky
 */
import {GlobalAttributes, RefferPolicy,Priority} from "../Attributes";

export default interface ImageAttributes extends GlobalAttributes {
    src: string,
    alt: string,
    crossorigin?: "anonymous"|"use-credentials",
    decoding?: "sync"|"async"|"auto",
    elementtiming?: string,
    fetchpriority?: Priority,
    height?: number,
    ismap?: boolean,
    loading?: "eager"|"lazy",
    referrerpolicy?:RefferPolicy,
    sizes?: string,
    srcset?: string,
    width?:number,
    usemap?: string
}