/** /View/Web
 * 
 * Front End Web File
 * 
 * @author Alex Malotky
 */
import { FetchUpdate } from ".";
import RenderEnvironment from "./RenderEnvironment";
import { getRouteInfo } from "./RenderEnvironment/Util";

//Render Environment
const env = new RenderEnvironment();

/** Close Dialog
 * 
 * Created because override submit function doesn't seem to allowing defaulting to
 * browser.
 * 
 * Recursivly calls itself.
 * 
 * @param {HTMLElement} element 
 */
function closeDailog(element:HTMLElement|null){
    if(element === null || element === document.body)
        return;

    if(element.tagName === "DIALOG"){
        //@ts-ignore
        element.open = false;
        element.style.display = "none";
    } else {
        closeDailog(element.parentElement);
    }
}

/** Pop State Change Event Listener
 * 
 */
window.addEventListener("popstate", function state_change(){
    env.handler().then(anchor=>{
        if(anchor)
            env.scroll(anchor);
    }).catch(console.error);
});

/** Click Event Listener
 * 
 * @param {Event} event
 */
document.body.addEventListener("click", function click_event(event){
    const target = <HTMLElement>event.target;
    const link = target.closest("a");

    if(link){
        event.preventDefault();
        target.blur();
        link.blur();

        //Test for back
        if(link.getAttribute("href") === "..") {
            const path = window.location.pathname.split("/");
            let p = path.pop();
            while(p === undefined || p.trim() === "")
                p = path.pop();

            link.href = path.join("/");
        }

        if(link.getAttribute("target") !== "_blank" && link.href.indexOf(location.hostname) !== -1){
            const {anchor, path} = getRouteInfo(link.href);

            //Determine if scrolling or routing.
            if(location.pathname === path){
                env.scroll(anchor);
            } else {
                env.route(link.href);
            }
        } else {
            env.link(link.href);
        }
    }
});

/** Submit Event Listener
 * 
 * @param {Event} event
 */
document.body.addEventListener("submit", async function submit_event(event){
    const form = <HTMLFormElement> event.target;

    //Check that target is a form
    if(form.nodeName.toLocaleLowerCase() !== "form")
        return;

    event.preventDefault();
    const url = form.action || window.location.pathname;
    const method = (form.getAttribute("method") || "GET").toLocaleUpperCase();
    
    if(method === "DIALOG") {
        closeDailog(form);
        return;
    }
    
    const body = new FormData(form);
    let data: FetchUpdate
    try {
        data = await RenderEnvironment.fetch(url, {method, body});
    } catch (e){
        RenderEnvironment.error(e);
        return;
    }
    
    if(data.redirect){
        env.route(data.redirect);
    } else if(data.update){
        for(const id in data.update){
            const element = form.querySelector("#"+id) as HTMLElement|null;
            if(element){
                RenderEnvironment.render(element, data.update[id]);
            }
        }
    } else {
        env.update(data);
    }
});

/** Load Event Listener
 * 
 */
window.addEventListener("DOMContentLoaded", function run_scripts(){
    document.querySelectorAll("script[env]")?.forEach(script=>{
        if(script.getAttribute("type")?.includes("blocked"))
            env.run(script.innerHTML);
    });
})