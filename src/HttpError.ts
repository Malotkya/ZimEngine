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
function getMessage(value:number):string {
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
        return "Netowrk Authentication Required"

    return "Internal Server Error";
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
            message = "Invalid status: " + status
            status = 500;
        }else if(value < 300 || value > 599) {
            message = "Status is not an error!"
        }

        super(message || getMessage(value));
        this.#status = value;
    }

    /** Status Getter
     * 
     */
    get status():number{
        return this.#status;
    }
}