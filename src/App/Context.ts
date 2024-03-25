import {IncomingMessage as Request, ServerResponse as Response} from "http";
export {Request, Response};

export default class Context{
    #request:Request;
    #response:Response;
    #url:URL;
    #search:Dictionary<string>;
    #params:Dictionary<string>;

    constructor(request: Request, response: Response){

        //Getter Only Variables
        this.#request = request;
        this.#response = response;
        this.#url = new URL(request.url || "", `http://${request.headers.host}`);

        //Params Search Values
        this.#search = {};
        for(const [name, value] of this.#url.searchParams.entries())
            this.#search[name] = value;

        //Defaults
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

    status(value:number):Context {
        if(typeof value !== "number") {
            value = Number(value);
        }

        if(isNaN(value)) {
            throw new TypeError("Status code must be a nubmer!")
        } else if( value < 100 || value > 999) {
            throw new TypeError("Status code is out of range!");
        }
        
        this.#response.statusCode = value;
        return this;
    }

    json(object:Object){
        if (!this.#response.getHeader("Content-Type")) {
            this.#response.setHeader('Content-Type', 'application/json');
        }
        this.#response.write(JSON.stringify(object));
        return this;
    }

    text(value:string){
        if (!this.#response.getHeader("Content-Type")) {
            this.#response.setHeader('Content-Type', 'application/text');
        }
        this.#response.write(value);
        return this;
    }

    write(chunk:any){
        this.#response.write(chunk);
        return this;
    }

    done() {
        this.#response.end();
    }
}