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

    public constructor(path:string = "/", options:any={end:false}, layers:Array<Layer> = []){
        super(path, options, ()=>{throw new Error("_handler called from Router!")});
            
        this.#layers = layers;
    }

    /** Use Middleware or Route
     * 
     * originaly: use(path:string = "", ...middleware:Handler|Route)
     * 
     * @param {string} path 
     * @param {Handler|Layer|Array<Middleware|Layer>} middleware
     * @returns {Route}
     */
    public use(...args: Array<any>): Route {
        const layer = this.filter(args);

        if(Array.isArray(layer)){
            this.#layers.push(new Route(this._path, undefined, layer));
        } else {
            this.#layers.push(layer);
        }

        return this;
    }

    /** Handle Request Override
     * 
     * @param {Context} context 
     */
    async handle(context:Context){
        const query = context.query;
        for(let l of this.#layers) {
            if(l.match(context)) {
                await l.handle(context);
                context.query = query;
            }
        }
    }
}