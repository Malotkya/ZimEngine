/** Find Or Create Element
 * 
 * @param {string} name 
 * @param {Array<string>} parents 
 * @returns {HTMLElement}
 */
export function findOrCreateElement(name?:string, ...parents:Array<string>): HTMLElement{

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

/** Get Routing Info
 * 
 * Returns both the pathname and anchor id from a Hypertext Reference string.
 * 
 * @param {string} href 
 * @returns {{path:string, anchor:string}}
 */
export function getRouteInfo(href:string):{path:string, anchor:string} {
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

/** Hash Object
 * 
 */
export function hashObject(value:any):number {
    let string:string;
    switch(typeof value){
        case "number":
            return value;

        case "undefined":
            return 0;

        case "boolean":
            return Number(value);

        case "object":
            if(value === null)
                return 0;

            string = JSON.stringify(value);
            break;

        case "string":
            string = value;
            break;

        default:
            string = value.toString()
    }

    if(string.length === 0)
        return 0;

    let hash = 0;
    for(let i=0; i<string.length; i++) {
        hash = ((hash << 5) - hash) + string.charCodeAt(i);
        hash |= 0;
    }

    return hash;
}

/** Get Value From
 * 
 * @param {string} query 
 * @returns {string}
 */
export function getValueFrom(element:HTMLElement, name:string):string {
    const target = element.querySelector(`[name='${name}']`) as HTMLInputElement|null;

    if(target && target.value){
        return target.value;
    }

    return "";
}