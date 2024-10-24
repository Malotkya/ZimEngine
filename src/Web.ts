import { FetchUpdate } from "./View";
import RenderEnvironment from "./View/RenderEnvironment";
import { getRouteInfo } from "./View/RenderEnvironment/Util";

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

window.addEventListener("popstate", function state_change(event){
    env.handler().then(anchor=>{
        env.scroll(anchor);
    }).catch(console.error);
});

document.body.addEventListener("click", function click_event(event){
    const target:HTMLElement = event.target as HTMLElement;
    const link:HTMLAnchorElement|null = target.closest("a");

    if(link){
        event.preventDefault();
        target.blur();
        link.blur();

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

document.body.addEventListener("submit", async function submit_event(event){
    event.preventDefault();
    const form = event.target as HTMLFormElement;

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

window.addEventListener("DOMContentLoaded", ()=>{
    document.querySelectorAll("script[env]")?.forEach(script=>{
        if(script.getAttribute("type")?.includes("blocked"))
            env.run(script.innerHTML);
    });
})