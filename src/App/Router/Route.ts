import Layer, {Handler} from "./Layer"
import Context from "../Context";
import {join} from "path";

export default class Route extends Layer {
    #layers: Array<Layer>;

    public constructor(path:string = "", options?:any, layers:Array<Layer> = []){
        super(path, options);
        this.#layers = layers;
    }

    /** Use Middleware or Route
     * 
     * originaly: use(path:string|Array<string> = "", ...middleware:Handler|Route)
     * 
     * @param {string|Array<string>} path 
     * @param {Middleware|Router} middleware
     * @returns {Route}
     */
    public use(...args: Array<any>): Route {
        //Input Arguments
        let path: string;
        let middleware: Layer;

        //Filter Arguments
        switch (args.length){
            case 0:
                throw new Error("No arguments given!");

            case 1:
                path = "";
                middleware = Layer.init(path, this._options, args[0]);
                break;

            case 2:
                path = args[0];
                middleware = Layer.init(path, this._options, args[1]);
                break;
                
            default:
                path = args.shift();
                middleware = new Route(path, this._options,
                    args.map((value)=>Layer.init(path, this._options, value))
                );
        }

        this.#layers.push(middleware);
        return this;
    }

    public set path(value:string){
        for(let l of this.#layers)
            l.path = value;
    }

    async handle(context:Context){
        for(let l of this.#layers)
            l.handle(context);
    }
}