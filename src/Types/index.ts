import Primitive, {PrimitiveType} from "./Primitive";
import Complex, {ComplexType} from "./Complex";
import Empty, {EmptyType} from "./Empty";

type List = Array<Primitive|Complex|Empty>;
type Object = Dictionary<Primitive|Complex|Empty>;


type ObjectType = Dictionary<PrimitiveType|ComplexType|EmptyType>;

