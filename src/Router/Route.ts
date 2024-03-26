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

    public constructor(path:string = "", layers:Array<Layer> = []){
        super(path, undefined, true);
            
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
        const layer = this.filter(args);

        if(Array.isArray(layer)){
            this.#layers.push(new Route(this.path, layer));
        } else {
            this.#layers.push(layer);
        }

        return this;
    }

    /** Handle Request Override
     * 
     * @param {Context} context 
     */
    async handle(path:string, context:Context){
        const match = this.match(path, context);
        
        if(match){
            for(let l of this.#layers) {
                await l.handle(match, context);
            }
        }
    }
}