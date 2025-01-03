/** Validation/Types/File
 * 
 * @author Alex Malotky
 */
import { isEmpty, EmptyError } from "./Empty";

// File Type
type File = Blob;
export default File;

/** String to Blob
 * 
 * Taken From: https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
 * 
 * @param {string} dataURI 
 * @returns {Blob}
 */
function dataURIToBlob(dataURI:string):Blob{
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString:string;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

/** Text String To Blob
 * 
 * @param {string} value 
 * @returns {Blob}
 */
function textToBlob(value:string):Blob {
    const byteArray = new Uint8Array(value.length);

    for (let i=0; i<value.length; i++) {
        byteArray[i] = value.charCodeAt(i);
    }

    return new Blob([byteArray], { type: "text/plain" });
}

/** Format Email
 * 
 * Used to format / sanitize email input.
 * 
 * @param {unknown} value 
 * @returns {Email}
 */
export function formatFile(value:unknown):File {
    if(isEmpty(value)){
        throw new EmptyError()
    }else if(typeof value === "string") {
        try {
            return dataURIToBlob(value);
        } catch (e){
            return textToBlob(value);
        }
        
    } else if( !(value instanceof Blob) ) {
        throw new TypeError("File must be stored in a Blob or string!");
    }
        
    return value;
}

/** Validate Email
 * 
 * @param {unknown} value 
 * @returns {boolean}
 */
export function isFile(value:unknown):value is File {
    try {
        formatFile(value)
    } catch (e){
        return false;
    }

    return true;
}