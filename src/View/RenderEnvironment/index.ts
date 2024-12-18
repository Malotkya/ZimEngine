/** /View/RenderEnvironment
 * 
 * Front End Environment
 * 
 * @author Alex Malotky
 */
import {FetchUpdate} from "..";
import { getRouteInfo, hashObject } from "./Util";
import { HeadUpdate } from "../Html/Head";
import HeadEnvironment from "./Head";
import { HEADER_KEY, HEADER_VALUE } from "../../Util";

//Interface for Dialog Function
type DialogLevel = "error"|"warning"|"info";
interface DialogSettings {
    background: string,
    foreground: string,
    title?: string
}

/** Get Dialog Level Settings
 * 
 * @param {string} level 
 * @returns {Object}
 */
function getLevelSettings(level:DialogLevel):DialogSettings {
    switch(level){
        case "error":
            return {
                background: "#FFE5E5",
                foreground: "#D60007",
                title: "Error!"
            }

        case "warning":
            return {
                background: "#FFFEE5",
                foreground: "#BD5800",
                title: "Warning!"
            }

        case "info":
            return {
                background: "#E3EEFD",
                foreground: "#0260ED"
            }

        default:
            throw new Error("Unknown Settings Level!");
    }
}

//Fetch Options Type
interface FetchOptions extends RequestInit{
    headers?:Record<string, string>
}

//Event List Item Type
interface EventItem {
    type:string,
    listener:EventListener
}

/** Front End Render Environment
 * 
 */
export default class RenderEnvironment {
    private _head:HeadEnvironment;
    private _headHash:number;
    private _bodyHash:number;
    private _events:Array<EventItem>;

    private _routing:boolean;
    private _delay:{url:string|URL, opts?:FetchOptions}|undefined;

    /** Render Environment Constructor
     * 
     */
    constructor(){
        this._routing = false;
        this._head = new HeadEnvironment();
        this._headHash = 0;
        this._bodyHash = 0;
        this._events = [];
    }

    /** Main Route Handler
     * 
     * Returns value if there is an anchor to scroll too.
     * 
     * @param {FormData} body 
     * @returns {Promise<string|undefined>}
     */
    async handler(url:string|URL = window.location.href, opts?:FetchOptions):Promise<string|undefined>{
        this._routing = true;
        document.body.style.cursor = "wait";
        const {anchor, path} = getRouteInfo(url);

        try {
            const data = await this.fetch(path, opts);
            if(data.redirect){
                return this.handler(data.redirect);
            }
            await this.update(data);
            window.history.pushState({}, "", url);
        } catch (e){
            this.error(e);
            //Possible rerouting??
        }

        this._routing = false;
        document.body.style.cursor = "";

        if(this._delay){
            const {url, opts} = this._delay;
            
            this._delay = undefined;
            return this.handler(url, opts);
        }

        return anchor;
    }

    /** Route to locale page.
     * 
     * @param {string|URL} url 
     * @param {FetchOptions} opts 
     */
    async route(url:string|URL, opts?:FetchOptions){
        if(!this._routing) {
            this.clear();
            const anchor = await this.handler(url, opts);
            if(anchor)
                this.scroll(anchor);
        } else {
            this._delay = {url, opts};
        }
    }

    /** Scroll to Element
     * 
     * @param {string} id
     */
    scroll(id:string){
        if(id){
            const element = document.getElementById(id);
            if(element){
                element.scrollIntoView();
            }
        }
    }

    /** Open External Link
     * 
     * @param {string|URL} href
     */
    link(href:string|URL){
        window.open(href, '_blank' , 'noopener,noreferrer')
    }

    /** Run Script
     * 
     * @param script 
     */
    run(script:string) {
        new Function("env", script)(this);
    }

    /** Add Event
     * 
     * @param update 
     */
    event(type:string, listener:EventListener){
        if(typeof type !== "string")
            throw new TypeError("Unknown event!");

        if(typeof listener !== "function")
            throw new TypeError("Unknown listener!");

        this._events.push({type, listener});
        window.addEventListener(type, listener);
    }

    /** Update Environment
     * 
     * @param {RenderUpdate} update 
     */
    async update(update:FetchUpdate){
        if(update.head){
            await this.updateHead(update.head);
        }
        if(update.body){
            this.updateBody(update.body);
        }
    }

    ////////////// Private Update Methods //////////////

    /** Update Head
     * 
     * @param {HeadUpdate} update 
     */
    private async updateHead(update:HeadUpdate) {
        const hash = hashObject(update);
        if(hash === this._headHash){
            return console.info("Head didn't change!");
        }

        await this._head.update(update);
        this._headHash = hash;
    }

    /** Update Body
     * 
     */
    private updateBody(update:Record<string, string>) {
        const hash = hashObject(update);
        const scripts: Array<string> = [];

        if(hash === this._bodyHash){
            return console.info("Body didn't change!");
        }

        for(const id in update){
            const element = document.getElementById(id);
            if(element){
                this.render(element, update[id]);
                const match = update[id].match(/<script.*?>.*?<\/script.*?>/gi);
                if(match){
                    scripts.push(...match);
                }
            } else {
                console.warn(`Unable to find element with id '${id}'!`);
            }
        }

        this.scripts(scripts);
        this._bodyHash = hash;
    }

    /** Run Scripts
     * 
     * @param {RegExpMatchArray} update 
     */
    private scripts(update:Array<string>){
        for(let script of update) {
            this.run(script.replace(/^<script.*?>(.*?)<\/script.*?>$/gi, "$1"));
        }
    }

    /** Clear Events
     * 
     */
    private clear(){
        while(this._events.length > 0){
            const {type, listener} = this._events.pop()!;
            window.removeEventListener(type, listener);
        }
    }

    /** Modal Dialog
     * 
     * @param {string} level 
     * @param {string} message 
     */
    private dialog(level:DialogLevel, message:string) {
        const {background, foreground, title} = getLevelSettings(level);

        const dialog = document.createElement("dialog");
        dialog.style.position = "absolute";
        dialog.style.width = "100%";
        dialog.style.height = "100%";
        dialog.style.top = "0";
        dialog.style.left = "0";
        dialog.style.display = "flex";
        dialog.style.alignItems = "center";
        dialog.style.justifyContent = "center";
        dialog.style.background = "rgba(0,0,0,0.5)";

        dialog.addEventListener("click", ()=>{
            document.body.removeChild(dialog);
        });

        const modal = document.createElement("div");
        modal.style.backgroundColor = background;
        modal.style.padding = "10px";
        modal.style.borderRadius = "5px";
        modal.style.border = `solid ${foreground}`;

        modal.addEventListener("click", (event)=>{
            event.stopPropagation();
        });

        if(title){
            const header = document.createElement("h1");
            header.style.color = foreground;
            header.style.fontWeight = "bold";
            header.style.textAlign = "center";
            header.style.margin = "0";
            header.textContent = title;
            modal.appendChild(header);
        }
        

        const body = document.createElement("p");
        body.style.color = foreground;
        body.style.fontWeight = "bold";
        body.style.textAlign = "center";
        body.textContent = String(message);
        modal.appendChild(body);

        const close = document.createElement("button");
        close.style.display = "block";
        close.style.margin = "0 auto";
        close.textContent = "Ok";
        modal.appendChild(close);

        close.addEventListener("click", ()=>{
            document.body.removeChild(dialog);
        });
        
        dialog.appendChild(modal);
        dialog.open = true;
        document.body.appendChild(dialog);
    }

    ////////////// Static FunctionS //////////////

    /** Assign Render Content to Target
     * 
     * @param {HTMLElement} target 
     * @param {RenderContent} content 
     */
    render(target:HTMLElement&{value?:string}, content:string){

        if(target.value){ 
            target.value = content;
        } else {
            target.innerHTML = content;
        }
    }

    /** Fetch Wrapper
     * 
     * @param {stirng|URL} url 
     * @param {FetchOptions} opts 
     * @returns {Promise<RenderUpdate>}
     */
    async fetch(url:string|URL, opts:FetchOptions = {}):Promise<FetchUpdate> {
        if(opts.headers === undefined)
            opts.headers = {};
        opts.headers[HEADER_KEY] = HEADER_VALUE;

        const response = await fetch(url, opts);

        if(response.headers.get(HEADER_KEY) !== HEADER_VALUE) {
            throw new Error("Did not recieve an update response!");
        } else if(response.headers.get("Content-Type") !== "application/json") {
            throw new Error("Did not recieve JSON response!");
        }

        const data:FetchUpdate = await response.json();
            
        if(data.redirect === undefined && data.head === undefined && data.body === undefined && data.update === undefined){
            throw new Error("Recieved either an empty or invalid response!");
        }

        return data;
    }

    /** Display Error
     * 
     * @param {any} value 
     */
    error(value:any) {
        this.dialog("error", value.message || String(value));
        console.error(value);
    }

    /** Display Warning
     * 
     * @param {any} value 
     */
    warn(value:string){
        this.dialog("warning", value);
        console.warn(value);
    }

    /** Display Warning
     * 
     * @param {any} value 
     */
    alert(value:string){
        this.dialog("info", value);
    }

    /** Display Warning
     * 
     * @param {any} value 
     */
    info(value:string){
        this.dialog("info", value);
        console.info(value);
    }
}