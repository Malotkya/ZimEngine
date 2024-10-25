/** /Engine/Routing/Route.ts
 * 
 * @author Alex Malotky
 */
import Context from "../Context";
import Layer, { Middleware } from "./Layer";

const ROUTE_ERROR = ()=>{throw new Error("_handler called from Route!")}

export default class Route extends Layer {
    #layers: Array<Layer>;

    public constructor(path:string = "/") {
        super(path, {end: false}, ROUTE_ERROR);
        this.#layers = [];
    }

    async handle(context: Context):Promise<void> {
        const match = this.match(context);

        if(match !== null){
            for(const layer of this.#layers) {
                await layer.handle(context);
                if(context.response.commited())
                    return;
            }

            context.query = match;
        }
    }

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

        this.#layers.push(layer);
        return this;
    }
}