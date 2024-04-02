import {ContentUpdate, Content} from ".";

/** Pop State Event Override
 * 
 */
window.onpopstate = function popStateEvent(){
    routeHandler().then(()=>{
        const {anchor} = getRouteInfo(window.location.href);
        window.zim.scroll(anchor);
    }).catch(console.error);
}

/** Global Variables
 * 
 */
var isRouting:boolean = false;
//@ts-ignore;
window.zim = {};

/** Zim Engine Route
 * 
 * @param {string} href 
 * @param {BodyData} body 
 */
window.zim.route = function route(href:string, body?:BodyData){
    if(!isRouting) {
        const {anchor} = getRouteInfo(href);
        window.history.pushState({}, "", href);

        //Convert body to FormData
        if(typeof body !== "object" && body !== undefined) {
            throw new TypeError("Unknown BodyData type!");
        } else if(body instanceof Map){
            const temp = new FormData();
            for(let [name, value] of body.entries()){
                temp.append(name, String(value));
            }
            body = temp;
        } else if( !(body instanceof FormData) && body !== undefined){
            const temp = new FormData();
            for(let name in body){
                temp.append(name, String(body[name]));
            }
            body = temp;
        }

        routeHandler(body).then(()=>{
            this.scroll(anchor);
        }).catch(console.error);
    }
    
}

/** Zim Engine Link
 * 
 * @param {string} href 
 */
window.zim.link = function link(href:string){
    if(typeof href === "string" && href !== ""){
        window.open(href, '_blank' , 'noopener,noreferrer');
    }
}
    

/** Zim Engine Scroll
 * 
 * @param {string} id 
 */
window.zim.scroll = function scroll(id:string){
    if(typeof id === "string" && id !== ""){
        const target = document.getElementById(id);
        if(target)
            target.scrollIntoView();
    }
}

/** Get Routing Info
 * 
 * Returns both the pathname and anchor id from a Hypertext Reference string.
 * 
 * @param {string} href 
 * @returns {{path:string, anchor:string}}
 */
function getRouteInfo(href:string):{path:string, anchor:string} {
    let regex:string = "(https?://" + location.hostname;

    const port:string = location.port;
    if(port !== "80" && port !== "443")
        regex += ":" + port;
    href = href.replace(new RegExp(regex+")"), "");

    const index:number = href.indexOf("#");
    if(index < 0){
        return {
            path: href,
            anchor: ""
        };
    } else if(index === 0){
        return {
            path: "",
            anchor: href
        };
    }

    return {
        path: href.substring(0, index),
        anchor: href.substring(index+1)
    }
}

/** Main Route Handler
 * 
 * @param {FormData} body 
 */
async function routeHandler(body?:FormData):Promise<void>{
    isRouting = true;

    const response = await fetch(window.location.pathname, {
        headers: { "Content-Type": "application/json" },
        method: body? "POST": "GET",
        body: body
    });

    if(!response.ok || response.headers.get("Content-Type") !== "application/json")
        window.location.reload();

    const update:ContentUpdate = await response.json();

    for(let name in update.header.update){
        switch(name.toLowerCase()) {
            case "base":
                findOrCreateElement(name, "head").setAttribute("href", update.header.update[name]);
                break;

            case "title":
                findOrCreateElement(name, "head").textContent = update.header.update[name];
                break;

            case "script":
            case "link":
                findOrCreateElement(`${name}[name='default']`, "head").setAttribute("href", update.header.update[name]);
                break;

            case "style":
                findOrCreateElement(`${name}[name='default']`, "head").textContent = update.header.update[name];
                break;

            case "meta":
                console.warn("Unable to get meta tag: "+name);
                break;

            //meta tags    
            default:
                findOrCreateElement(`meta[name='${name}']`, "head").setAttribute("content", update.header.update[name]);
                break;
        }
    }

    const head = findOrCreateElement("head");
    for(let name of update.header.delete){
        let element:HTMLElement|null;
        switch(name.toLocaleLowerCase()){
            case "base":
                element = head.querySelector(name);
                break;

            case "title":
                element = head.querySelector(name);
                break;

            case "script":
            case "link":
            case "style":
                element = head.querySelector(`${name}[name='default']`);
                break;

            case "meta":
                console.warn("Unable to get meta tag: "+name);
                break;

            //meta tags    
            default:
                element = head.querySelector(`meta[name='${name}']`); 
        }

        //@ts-ignore
        if(element)
            head.removeChild(element);
    }

    const target = findOrCreateElement("main", "body");
    target.innerHTML = "";
    insertContent(target, update.content);
    isRouting = false;
}

/** Insert Content 
 * 
 * @param {HTMLElement} target 
 * @param {Content} content 
 */
function insertContent(target:HTMLElement, content:Content){
    if(Array.isArray(content)){
        for(let c of content)
            insertContent(target, c);
    } else if(content !== null){
        target.innerHTML += String(content);
    }
}

/** Find Or Create Element
 * 
 * @param {string} name 
 * @param {Array<string>} parents 
 * @returns {HTMLElement}
 */
function findOrCreateElement(name?:string, ...parents:Array<string>): HTMLElement{

    if(typeof name === "undefined"){
        return document.body;
    } else if(typeof name !== "string"){
        throw new TypeError(`Unknown type '${typeof name}' for query string`);
    }

    let node:HTMLElement | null = document.querySelector(name);
    if(node)
        return node;

    node = findOrCreateElement(...parents);

    let attributes: Array<string>|undefined;
    let index = name.indexOf("[");
    if(index > 0){
        attributes = name.replace(/.*?\[(.*?)='(.*?)'\]?/gm, "$1=$2 ").split(/\s+/gm) || [];
        name = name.substring(0, index);
    }

    let id:string|undefined;
    let className:string|undefined;

    index = name.indexOf("#");
    if(index >= 0) {
        id = name.substring(index+1);
        name = name.substring(0, index);
    }

    index = name.indexOf(".");
    if(index >= 0) {
        className = name.substring(index+1);
        name = name.substring(0, index);
    }

    if(name.trim().length === 0){
        name = "div";
    }

    let newNode = document.createElement(name);
    if(id)
        newNode.id = id;
    
    if(className)
        newNode.className = className;

    if(attributes){
        for(let string of attributes){
            string = string.trim();
            if(string.length > 3){
                const buffer = string.split("=");
                newNode.setAttribute(buffer[0], buffer[1]);
            }
        }
    }

    node.appendChild(newNode);

    return newNode;
}

/** Routing Event Listener
 * 
 * @param {Event} event;
 */
document.body.addEventListener("click", function routeEvent(event:Event){
    const target:HTMLElement = event.target as HTMLElement;
    const link:HTMLAnchorElement|null = target.closest("a");

    if(link){
        event.preventDefault();
        target.blur();

        if(link.getAttribute("target") !== "_blank" && link.href.indexOf(location.hostname) !== -1){
            const {anchor, path} = getRouteInfo(link.href);

            //Determine if scrolling or routing.
            if(location.pathname === path){
                window.zim.scroll(anchor);
            } else {
                window.zim.route(link.href);
            }
        } else {
            window.zim.link(link.href);
        }
    }
})