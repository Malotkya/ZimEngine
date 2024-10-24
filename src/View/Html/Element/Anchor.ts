/** /Engine/View/Html/Attributes/Map/Anchor
 * 
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a
 * 
 * @author Alex Malotky
 */
import { GlobalAttributes, RefferPolicy, Target, SpaceSeperatedList } from "../Attributes";

// https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel
export type AnchorRel = "alternate"|"author"|"bookmark"|"external"|"help"|"liscense"|"me"|"next"|"nofollow"|"noopener"|"noreferrer"|"opener"|"prev"|"privacy-policy"|"search"|"tag"|"terms-of-service";

export default interface AnchorAttributes extends GlobalAttributes {
    attributionsrc?:boolean|string,
    download?: boolean|string,
    href?: string,
    hreflang?: string,
    ping?: SpaceSeperatedList,
    referrerpolicy?: RefferPolicy,
    rel?: AnchorRel,
    target?: Target,
    type?: string
}