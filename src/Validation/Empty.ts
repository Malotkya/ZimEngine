/** /Validation/Empty
 * 
 * @author Alex Malotky
 */
import { TypeValidator } from "./Type";
import Empty, {formatEmpty} from "./Type/Empty";

//Empty Format Name
export const EmptyName = "Empty";

/** Empty Validator
 * 
 */
export default class EmptyValidator extends TypeValidator<Empty> {
    constructor() {
        super(EmptyName, formatEmpty);
    }
}


