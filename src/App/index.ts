import Route from "./Router/Route";
import {IncomingMessage, ServerResponse} from "http";
import Context from "./Context";

type Engine = (incoming:IncomingMessage, response:ServerResponse) => void;

export default class App extends Route{
    #engine:Engine;

    constructor(){
        super(undefined, undefined);
        this.#engine = (incoming:IncomingMessage, response:ServerResponse) => {
            this.handle(new Context(incoming, response))
        }
    }

    get engine():Engine{
        return this.#engine;
    }
}