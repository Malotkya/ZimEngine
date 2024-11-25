/** /View/RenderEnvironment/Head
 * 
 * Front End Head Element
 * 
 * @author Alex Malotky
 */
import {findOrCreateElement} from "./Util";
import { HeadUpdate } from "../Html/Head";
import { AttributeList } from "../Html/Attributes";
import Tracker from "./Tacker";
import Scripts from "./Scripts";

/** Front End Head Environment Manager
 * 
 */
export default class HeadEnvironment {
    private _meta:Tracker;
    private _links:Tracker;
    private _styles:Tracker;
    private _scripts:Scripts;

    private _title:HTMLTitleElement;
    private _defaultTitle:string;

    /** Constructor
     * 
     */
    constructor(){
        const head = findOrCreateElement("head");

        //Element Trackers
        this._meta = new Tracker(head, "meta");
        this._links = new Tracker(head, "links");
        this._styles = new Tracker(head, "style");
        this._scripts = new Scripts(head);

        //Title Tracker Attributes
        this._title = head.querySelector("title") as HTMLTitleElement;
        this._defaultTitle = this._title.textContent || "";
        
        const index = this._defaultTitle.indexOf("|");
        if(index >= 0){
            this._defaultTitle = this._defaultTitle.substring(0, index-1).trim();
        }
    }

    /** Update Head Environment
     * 
     * @param {HeadUpdate} update 
     */
    async update(update:HeadUpdate) {
        if(this._defaultTitle === ""){
            this._title.textContent = update.title || "";
        } else if(update.title === undefined || update.title === ""){
            this._title.textContent = this._defaultTitle;
        } else {
            this._title.textContent = this._defaultTitle + " | " + update.title;
        }

        const meta:Record<string, AttributeList> = {};
        for(let name in update.meta){
            meta[name] = {
                content: update.meta[name]
            };
        }

        this._meta.update(meta);
        this._links.update(update.links!);
        this._styles.update(update.styles! as Record<string, AttributeList>);
        await this._scripts.update(update.scripts!);
    }
}