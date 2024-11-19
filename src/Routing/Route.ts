/** /Routing/Route.ts
 * 
 * @author Alex Malotky
 */
import Context from "../Context";
import Layer, { Middleware } from "./Layer";

//Route Error Thrower
const ROUTE_ERROR = ()=>{throw new Error("_handler called from Route!")}

/** Route Layer
 * 
 * Array<Layer> Wrapper
 */
export default class Route extends Layer {
    #layers: Array<Layer>;

    /** Constructor
     * 
     * @param {string} path 
     */
    public constructor(path:string = "/") {
        super(path, {end: false}, ROUTE_ERROR);
        this.#layers = [];
    }

    /** Handle Routing Override
     * 
     * @param {Context} context 
     */
    async handle(context: Context):Promise<void> {
        if(this.match(context)){
            for(const layer of this.#layers) {
                await layer.handle(context);
                if(context.response.commited())
                    return;
            }
        }
    }

    /** Use Middleware
     * 
     * @param {string} path = "/"
     * @param {Middleware|Layer} middleware 
     */
    use(middleware:Middleware|Layer):Route
    use(path:string, handler:Middleware):Route
    use(){
        let layer:Layer;
        switch(typeof arguments[0]){
            case "object":
                layer = arguments[0];
                break;

            case "function":
                layer = new Layer("/", arguments[0])
                break;

            case "string":
                if(typeof arguments[1] !== "function")
                    throw new TypeError("Endpoint must be a function!");

                layer = new Layer(arguments[0], arguments[1]);
                break;

            default:
                throw new TypeError("Path must be a string!");
        }

        layer.prefix(this.totalPath());
        this.#layers.push(layer);
        return this;
    }

    /** Set Prefix Override
     * 
     * @param {string} value 
     */
    prefix(value:string){
        super.prefix(value);
        for(const l of this.#layers) {
            l.prefix(this.totalPath());
        }
    }
}