export default class Path {
    protected _list:Array<string>;
    #shortcut:boolean;
    #keys:Array<string>;
    #partial:boolean;

    constructor(value:string, allowPartial:boolean = false){
        if(typeof value !== "string") {
            throw new TypeError("Value must be a string!");
        } else if(value === "" || value === "/"){
            this._list = [];
            this.#shortcut = false;
        } else if(value === "*" || value === "/*"){
            this._list = [];
            this.#shortcut = true;
        } else {
            this._list = value.split("/").filter(value => value !== "");
            this.#shortcut = false;
        }

        this.#partial = allowPartial;

        this.#keys = [];
        for(let part of this._list){
            if(part.charAt(0) === ":") {
                const partial = part.charAt(part.length-1) === "?"
                if(partial)
                    this.#partial = true;

                this.#keys.push(part.substring(1, partial? part.length - 1: part.length))
            }
        }
    }

    match(path:string|Path):{path:Path, params:Dictionary<string>}|null{
        if(typeof path === "string"){
            path = new Path(path);
        } else if(path instanceof Path) {
            path = new Path(path._list.join("/"));
        } else {
            throw new TypeError("Invalid Path for Matching!");
        }

        let params:Dictionary<string> = {};

        if(this.#shortcut) {
            return {path, params}
        }

        if(!this.#partial && (this._list.length !== path._list.length))
            return null;

        const max_length = path._list.length;
        let index = 0, keyIndex = 0;
        while(index < this._list.length){
            const lhs = this._list[index++];
            const rhs = path._list.shift();

            if(lhs === "*")
                return {path, params};

            if(lhs.charAt(0) === ":"){
                if(lhs.charAt(lhs.length-1) !== "?" && rhs === undefined) {
                    return null;
                } else if(rhs){
                    params[this.#keys[keyIndex++]] = decodeURI(rhs);
                }
            } else if(index >= max_length || lhs !== rhs) {
                return null;
            }
        }

        return {path, params};
    }

    join(value:Path|string):Path {
        if(value instanceof Path)
            value = value._list.join("/");

        return new Path(this._list.join("/").concat("/", value));
    }

    get value():string {
        return "/".concat(this._list.join("/"));
    }
}