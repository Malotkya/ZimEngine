import Route from "./Router/Route";
import {IncomingMessage, ServerResponse} from "http";
import Context from "./Context";
import Router from "./Router";

export {Context, Router};
export type Engine = (incoming:IncomingMessage, response:ServerResponse) => void;
export default class App extends Route{
    #engine:Engine;

    constructor(){
        super(undefined, undefined);
        this.#engine = function(incoming:IncomingMessage, response:ServerResponse){
            this.handle(new Context(incoming, response))
        }
    }

    get engine():Engine{
        return this.#engine;
    }
}