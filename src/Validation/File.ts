/** Validation/File
 * 
 * @author Alex Malotky
 */
import { TypeValidator } from "./Type";
import File, { formatFile } from "./Type/File";

//Email Format Type
export const FileName = "File"

/** File Validator
 * 
 */
export default class FileValidator extends TypeValidator<File> {
    constructor() {
        super(FileName, formatFile)
    }
}

