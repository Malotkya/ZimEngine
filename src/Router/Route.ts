/** /Router/Route
 * 
 * @author Alex Malotky
 */
import Layer from "./Layer"
import Context from "../Context";

/** Route
 * 
 * Array of Layers
 */
export default class Route extends Layer {
    #layers: Array<Layer>;

    public constructor(path:string = "", options?:any, layers:Array<Layer> = []){
        super(path, options);
            
        this.#layers = layers;
        this.path = path;
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
                path = String(args[0]);
                middleware = Layer.init(path, this._options, args[1]);
                break;
                
            default:
                path = String(args.shift());
                middleware = new Route(path, this._options,
                    args.map((value)=>Layer.init(path, this._options, value))
                );
        }

        this.#layers.push(middleware);
        return this;
    }

    /** Path setter override.
     * 
     */
    public set path(value:string){
        for(let l of this.#layers)
            l.path = value;
    }

    /** Handle Request Override
     * 
     * @param {Context} context 
     */
    async handle(context:Context){
        for(let l of this.#layers)
            l.handle(context);
    }
}