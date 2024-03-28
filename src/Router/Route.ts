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

    public constructor(path:string = "", options:any={shortcut:true}, layers:Array<Layer> = []){
        super(path, options, ()=>{throw new Error("_handler called from Router!")});
            
        this.#layers = layers;
        for(let l of this.#layers)
            l.path = this.path;
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
            this.#layers.push(new Route(this.path, undefined, layer));
        } else {
            layer.path = this._path;
            this.#layers.push(layer);
        }

        return this;
    }

    /** Handle Request Override
     * 
     * @param {Context} context 
     */
    async handle(context:Context){
        for(let l of this.#layers) {
            await l.handle(context);
        }
    }

    public set path(value:string){
        super.path = value;
        for(let l of this.#layers)
            l.path = this.path;
    }
}