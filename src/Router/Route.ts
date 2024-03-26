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
        const layer = this.filter(args);

        if(Array.isArray(layer)){
            this.#layers.push(new Route(this.path, this._options, layer));
        } else {
            layer.path = this.path;
            this.#layers.push(layer);
        }

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