import { AttributeList } from "../Html/Attributes";
import Tracker from "./Tacker";

export default class Scripts extends Tracker{

    constructor(head:HTMLElement){
        super(head, "script");
    }

    update(updates:Dictionary<AttributeList>):Promise<void[]>{
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