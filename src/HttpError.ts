/** /HttpError
 * 
 * @author Alex Malotky
 */

/** Get Message
 * 
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 * 
 * @param {number} value 
 * @returns {string}
 */
export function getMessage(value:number):string|null {
    if(value < 100)
        return null;

    if(value === 100)
        return "Continue";

    if(value === 101)
        return "Switching Protocols";

    if(value === 102)
        return "Processing";

    if(value === 103)
        return "Early Hints";

    if(value < 200)
        return "Informational";

    if(value === 200)
        return "OK";

    if(value === 201)
        return "Created";

    if(value === 202)
        return "Accepted";

    if(value === 203)
        return "Non-Authoritative Information";

    if(value === 204)
        return "No Content";

    if(value === 205)
        return "Reset Content";

    if(value === 206)
        return "Partial Content";

    if(value === 207)
        return "Multi-Status";

    if(value === 208)
        return "Already Reported";

    if(value === 226)
        return "IM Used";

    if(value < 300)
        return "Success";

    if(value === 300)
        return "Multiple Choices";

    if(value === 301)
        return "Moved Permanently";

    if(value === 302)
        return "Found";

    if(value === 303)
        return "See Other";

    if(value === 304)
        return "Not Modified";

    if(value === 305)
        return "Use Proxy";

    if(value === 306)
        return "Switch Proxy";

    if(value === 307)
        return "Temporary Redirect";

    if(value === 308)
        return "Permanent Redirect";

    if(value < 400)
        return "Redirected";

    if(value === 401)
        return "Unauthorized";

    if(value === 402)
        return "Payment Required";

    if(value === 403)
        return "Forbidden";

    if(value === 404)
        return "Not Found";

    if(value === 405)
        return "Method Not Allowed";

    if(value === 406)
        return "Not Acceptable";

    if(value === 407)
        return "Proxy Authentication Required";

    if(value === 408)
        return "Request Timeout";

    if(value === 409)
        return "Conflict";

    if(value === 410)
        return "Gone";

    if(value === 411)
        return "Length Required";

    if(value === 412)
        return "Precondition Failed";

    if(value === 413)
        return "Payload Too Large";

    if(value === 414)
        return "URI Too Long";

    if(value === 415)
        return "Unsupported Media Type";

    if(value === 416)
        return "Range Not Satisfiable";

    if(value === 417)
        return "Expectation Failed";

    if(value === 421)
        return "Misdirected Request";

    if(value === 422)
        return "Unprocessable Content";

    if(value === 423)
        return "Locked";

    if(value === 424)
        return "Failed Dependency";

    if(value === 425)
        return "Too Early";

    if(value === 426)
        return "Upgrade Required";

    if(value === 428)
        return "Precondition Required";

    if(value === 429)
        return "Too Many Requests";

    if(value === 431)
        return "Request Header Fields Too Large";

    if(value === 451)
        return "Unable for Legal Reasons";

    if(value < 500)
        return "Bad Request";

    if(value === 501)
        return "Not Implemented";

    if(value === 502)
        return "Bad Gateway";

    if(value === 503)
        return "Service Unabailable";

    if(value === 504)
        return "Gateway Timeout";

    if(value === 505)
        return "HTTP Version Not Supported";

    if(value === 506)
        return "Variant Also Negotiates";

    if(value === 507)
        return "Insufficient Storage";

    if(value === 508)
        return "Loop Detected";

    if(value === 510)
        return "Not Extended";

    if(value === 511)
        return "Network Authentication Required"

    return null;
}

/** Http Error
 * 
 */
export default class HttpError extends Error{
    #status:number;

    /** constructor
     * 
     * @param {number} status 
     * @param {string} message 
     */
    constructor(status:number, message?:string){
        let value:number = Number(status);

        if(isNaN(value)) {
            message = "Invalid status: " + status;
            status = 500;
        }else if(value < 300 || value > 599) {
            message = `Status ${status} is not an error!`;
            status = 500;
        }

        super(message || getMessage(value) || "Internal Server Error");
        this.#status = value;
    }

    /** Status Getter
     * 
     */
    get status():number{
        return this.#status;
    }
}