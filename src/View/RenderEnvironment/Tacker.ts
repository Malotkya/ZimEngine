import { findOrCreateElement } from "./Util";
import { AttributeList } from "../Html/Attributes";

export default class Tracker {
    protected _current:Dictionary<Element>;
    private _name:string;

    constructor(head:HTMLElement, name:string){
        this._current = {};
        this._name = name;

        for(const element of Array.from(head.querySelectorAll(name))){
            const name = element.getAttribute("name");
            if(name){
                const defaults:Dictionary<string|undefined> = {};
                for(let att of element.getAttributeNames()){
                    defaults[att] = element.getAttribute(att) || undefined;
                }
                this._current[name] = element;
            }
        }
    }

    update(updates:Dictionary<AttributeList>){
        const lstUpdate = Object.getOwnPropertyNames(updates);

        //Loop over current tags
        for(let name in this._current){
            const index = lstUpdate.indexOf(name);

            //If being updated
            if( index !== -1){
                Tracker.updateElement(this._current[name], updates[name]);
                lstUpdate.splice(index, 1);

            //If had default value
            } else {
                this._current[name].parentElement!.removeChild(this._current[name]);
                delete this._current[name];
            }
        }

        //Loop through tags to add
        for(let name of lstUpdate){
            this._current[name] = findOrCreateElement(`${this._name}[name='${name}']`, "head");
            Tracker.updateElement(this._current[name], updates[name]);
        }
    }

    static updateElement(element:Element, update:AttributeList = {}){
        if(update.value) {
            element.innerHTML = update.value as string;
            delete update.value;
        }

        const lstUpdate = Object.getOwnPropertyNames(update);
        
        for(let name of element.getAttributeNames()) {
            const index = lstUpdate.indexOf(name);

            if(index !== -1){
                element.setAttribute(name, String(update[name]));
                lstUpdate.splice(index, 1);
            } else {
                element.removeAttribute(name);
            }
        }

        for(let name of lstUpdate){
            element.setAttribute(name, String(update[name]));
        }
    }
}