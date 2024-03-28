interface Dictionary<t> {
    [index:string]:t
}

declare interface Window {
    zim: {
        route: (href:string, body?:any)=>void
        link: (href:string)=>void
        scroll: (target:string)=>void
    }
}