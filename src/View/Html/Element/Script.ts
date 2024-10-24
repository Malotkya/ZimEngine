/** /Engine/View/Html/Attributes/Map/SampleOutput
* 
* https://developer.mozilla.org/en-US/docs/Web/HTML/Element/samp
* 
* @author Alex Malotky
*/
import {GlobalAttributes, CrossOrigin, Priority, RefferPolicy} from "../Attributes";

export default interface ScriptAttributes extends GlobalAttributes{
    async?:boolean,
    attributeionsrc?:string|boolean,
    blocking?:"render"|boolean,
    corssorigin?:CrossOrigin,
    defer?:boolean,
    fetchpriority?: Priority,
    integrity?:string,
    nomodule?:boolean,
    nonce?:string,
    refferpolicy?: RefferPolicy,
    src?:string,
    type?: "importmap"|"module"|"specultaionrules",
    charset?:"utf-8",
    language?:string,
    
    /* unofficial */
    name?:string
    env?: boolean
}