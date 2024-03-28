interface Dictionary<t> {
    [index:string]:t
}

type BodyData = Dictionary<string>|FormData|Map<string,string>

declare interface Window {
    zim: {
        route: (href:string, body?:BodyData)=>void
        link: (href:string)=>void
        scroll: (target:string)=>void
    }
}