import {ContentUpdate, Content} from ".";

window.onload = () => {
    //Do something?
}

window.onpopstate = function popStateEvent(){
    routeHandler().then(()=>{
        const {anchor} = getRouteInfo(window.location.href);
        window.zim.scroll(anchor);
    }).catch(console.error);
}

//@ts-ignore;
window.zim = {};
var isRouting:boolean = false;

window.zim.route = function route(href:string, body?:any){
    if(!isRouting) {
        const {path, anchor} = getRouteInfo(href);
        window.history.pushState({}, "", href);

        routeHandler().then(()=>{
            if(anchor)
                this.scroll(anchor);
        }).catch(console.error);
    }
    
}

window.zim.link = function link(href:string){
    window.open(href, '_blank' , 'noopener,noreferrer');
}

window.zim.scroll = function scroll(id:string){
    const target = document.getElementById(id);
    if(target)
        target.scrollIntoView();
}

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

async function routeHandler(body?:FormData):Promise<void>{
    isRouting = true;

    const response = await fetch(window.location.pathname, {
        headers: { "Content-Type": "application/json" },
        body: body
    });

    if(!response.ok || response.headers.get("Content-Type") !== "application/json")
        window.location.reload();

    const update:ContentUpdate = await response.json();

    for(let name in update.head){
        switch(name.toLowerCase()) {
            case "base":
                findOrCreateElement(name, "head").setAttribute("href", update.head[name]);
                break;

            case "title":
                findOrCreateElement(name, "head").textContent = update.head[name];
                break;

            case "script":
            case "link":
                findOrCreateElement(`$${name}[name='default']`, "head").setAttribute("href", update.head[name]);
                break;

            case "style":
                findOrCreateElement(`$${name}[name='default']`, "head").textContent = update.head[name];
                break;

            //meta tags    
            default:
                findOrCreateElement(`meta[name='${name}']`, "head").setAttribute("content", update.head[name])
                break;
    
            case "meta":
                console.warn("Unable to get meta tag: "+name);
        }
    }

    insertContent(findOrCreateElement("main", "body"), update.content);
    isRouting = false;
}

function insertContent(target:HTMLElement, content:Content){
    if(Array.isArray(content)){
        for(let c in content)
            insertContent(target, c);
    } else if(content !== null){
        target.innerHTML = String(content);
    }
}

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