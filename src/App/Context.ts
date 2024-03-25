import {IncomingMessage as Request, ServerResponse as Response} from "http";
export {Request, Response};

export default class Context{
    #request:Request;
    #response:Response;
    #url:URL;
    #search:Dictionary<string>;
    #params:Dictionary<string>;

    constructor(request: Request, response: Response){
        this.#request = request;
        this.#response = response;
        this.#url = new URL(request.url || "", `http://${request.headers.host}`);

        this.#search = {};
        for(const [name, value] of this.#url.searchParams.entries())
            this.#search[name] = value;
        this.#params = Object.create(this.#search);
    }

    get request():Request {
        return this.#request;
    }

    get response():Response {
        return this.#response;
    }

    get url():URL {
        return this.#url;
    }

    get method():string|undefined {
        return this.request.method;
    }

    set params(value:Dictionary<string>){
        this.#params = Object.create(this.#search);

        for(let name in value){
            this.#params[name] = String(value[name]);
        }
    }

    get params():Dictionary<string>{
        return this.#params;
    }
}