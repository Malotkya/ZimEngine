import {FetchUpdate} from "..";
import { getRouteInfo, hashObject } from "./Util";
import { HeadUpdate } from "../Html/Head";
import HeadEnvironment from "./Head";
import { HEADER_KEY, HEADER_VALUE } from "../../Util";


interface FetchOptions extends RequestInit{
    headers?:Dictionary<string>
}

interface Event {
    type:string,
    listener:EventListener
}

export default class RenderEnvironment {
    private _head:HeadEnvironment;
    private _headHash:number;
    private _bodyHash:number;
    private _events:Array<Event>;

    private _routing:boolean;
    private _delay:{url:string|URL, body?:FormData}|undefined;

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
     * Returns if there is an anchor to scroll too.
     * 
     * @param {FormData} body 
     * @returns {Promise<string>}
     */
    async handler(body?:FormData):Promise<string>{
        this._routing = true;
        const {anchor, path} = getRouteInfo(window.location.href);

        try {
            const data = await RenderEnvironment.fetch(path, {body});
            if(data.redirect){
                window.history.pushState({}, "", data.redirect);
                return this.handler();
            }
            await this.update(data);
        } catch (e){
            RenderEnvironment.error(e);
        }

        this._routing = false;

        if(this._delay){
            const {url, body} = this._delay;
            window.history.pushState({}, "", url);
            this._delay = undefined;
            return this.handler(body);
        }

        return anchor;
    }

    /** Route to locale page.
     * 
     * @param {string|URL} url 
     * @param {FormData} body 
     */
    route(url:string|URL, body?:FormData){
        if(!this._routing) {
            window.history.pushState({}, "", url);
            this.clear();
            this.handler(body).then(anchor=>{
                this.scroll(anchor);
            })
        } else {
            this._delay = {url, body};
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

    /// Private Update Methods ///

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
    private updateBody(update:Dictionary<string>) {
        const hash = hashObject(update);
        const scripts: Array<string> = [];

        if(hash === this._bodyHash){
            return console.info("Body didn't change!");
        }

        for(const id in update){
            const element = document.getElementById(id);
            if(element){
                RenderEnvironment.render(element, update[id]);
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

    /// Static FunctionS ///

    /** Assign Render Content to Target
     * 
     * @param {HTMLElement} target 
     * @param {RenderContent} content 
     */
    static render(target:HTMLElement&{value?:string}, content:string){

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
    static async fetch(url:string|URL, opts:FetchOptions):Promise<FetchUpdate> {
        if(opts.headers === undefined)
            opts.headers = {};
        opts.headers[HEADER_KEY] = HEADER_VALUE;

        try {
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
        } catch (e){
            throw e;
        }
    }

    static error(value:any) {
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
        modal.style.backgroundColor = "white";
        modal.style.padding = "5px";

        modal.addEventListener("click", (event)=>{
            event.stopPropagation();
        });

        const header = document.createElement("h1");
        header.style.color = "red";
        header.style.textAlign = "center";
        header.textContent = "Error";
        modal.appendChild(header);

        const message = document.createElement("p");
        message.style.color = "red";
        message.style.textAlign = "center";
        message.textContent = String(value);
        modal.appendChild(message);

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
        console.error(value);
    }
}