/** /Types/Primitive
 * 
 * @author Alex Malotky
 */
import { BooleanType } from "./Boolean";
import { NumberType } from "./Number";
import { StringType } from "./String";

type Primitive = number|boolean|string;
export default Primitive;

export type PrimitiveType = BooleanType|NumberType|StringType;