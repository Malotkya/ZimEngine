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

type Env = unknown;
type User = unknown;

declare const VERSION = "#.#.#.?"