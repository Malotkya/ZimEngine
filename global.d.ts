declare module '*.md' {
    const content: string;
    export default content;
}

declare module '*.scss' {
    const content: string;
    export default content;
}

interface Dictionary<t> {
    [index:string]:t
}

interface Env {
    ASSETS?: Fetcher
    [key:string]:any
}

type User = unknown;

declare const VERSION = "#.#.#.?"