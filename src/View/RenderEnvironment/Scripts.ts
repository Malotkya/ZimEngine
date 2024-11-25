/** /View/RenderEnvironment/Scripts
 * 
 * Front End Script Element Tracker
 * 
 * @author Alex Malotky
 */
import { AttributeList } from "../Html/Attributes";
import Tracker from "./Tacker";

/** Scripts Tracker
 * 
 */
export default class Scripts extends Tracker{

    /** Constructor for "Script"
     * 
     * @param head 
     */
    constructor(head:HTMLElement){
        super(head, "script");
    }

    /** Update Scripts override
     * 
     * @param updates 
     * @returns 
     */
    update(updates:Record<string, AttributeList>):Promise<void[]>{
        super.update(updates);
        const waits: Array<Promise<void>> = [];

        for(const name in this._current) {
            const script = this._current[name] as HTMLScriptElement;

            waits.push(new Promise(res=>{
                script.addEventListener("load", ()=>res(), {once: true});
            }));
        }

        return Promise.all(waits);
    }
}