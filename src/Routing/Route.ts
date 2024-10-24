/** /Engine/Routing/Route.ts
 * 
 * @author Alex Malotky
 */
import Context from "../Context";
import Layer, { EndPoint, Middleware } from "./Layer";

const ROUTE_ERROR = ()=>{throw new Error("_handler called from Route!")}

export default class Route extends Layer {
    #layers: Array<Layer>;

    public constructor(path:string = "/") {
        super(path, {end: false}, ROUTE_ERROR);
        this.#layers = [];
    }

    async handle(context: Context):Promise<Response|void> {
        const match = this._match(context);
        const path = context.query;
        context.params.clear();

        if(match){
            context.query = context.query.replace(match.path, "");
            for(let name in match.params){
                context.params.set(name, match.params[name]);
            }

            for(const layer of this.#layers) {
                const response = await layer.handle(context);
                if(response)
                    return response;
            }
        }

        context.query = path;
    }

    use(middleware:Middleware|EndPoint):Route
    use(path:string, handler:EndPoint):Route
    use(){
        let layer:Layer;
        switch(typeof arguments[0]){
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