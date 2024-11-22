/** /Validation/Email
 * 
 * @author Alex Malotky
 */
import { TypeValidator } from "./Type";
import { defaultFormatGenerator } from "./Util";
import Email, {formatEmail} from "./Type/Email";

// Email Format Name
export const EmailName = "Email"

/** Email Validator
 * 
 */
export default class EmailValidator extends TypeValidator<Email> {
    constructor(value?:Email) {
        super(EmailName, defaultFormatGenerator(formatEmail, EmailName, value))
    }
}

