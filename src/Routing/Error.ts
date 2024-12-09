/** /Routing/Error
 * 
 * @author Alex Malotky
 */
import Context from "../Context";
import { getMessage } from 'zim-engine/HttpError';

//Formated Error For Handling
interface FormatedError{
    status:number|string,
    message:string
}

interface InternalError {
    status?:number|string,
    message:string
}

//Handler Types
export type FormatedErrorHandler = (error:string, context:Context)=>Promise<void>|void;
export type DefaultErrorHandler = (error:FormatedError, context:Context)=>Promise<void>|void;

/** Error Routing
 * 
 * Seperates Error Handlers based on status codes
 * Falls back to a default handler if one is set.
 */
export default class ErrorRouting extends Map<number|string, FormatedErrorHandler>{
    private _default:DefaultErrorHandler|undefined;

    /** Format Error
     * 
     * @param {any} error 
     * @returns {InternalError}
     */
    private static formatError(error:any):InternalError{
        switch(typeof error){
            case "bigint":
                error = Number(error);

            case "number":
                return {
                    status: error,
                    message: getMessage(error) || "An unknown Error occured!"
                }

            case "string":
                return {
                    message: error
                }

            default:
                return {
                    status: error.code || error.status || error.statusCode,
                    message: error.message || String(error)
                }
        }
    }

    /** Internal Handle Error
     * 
     * Performs error handler if it exists
     * 
     * If handler throws new error, will double check if error handler can handle that error.
     * 
     * @param {InternalError} error 
     * @param {Context} context 
     * @returns {Promise<InternalError>}
     */
    private async _handle(error:InternalError, context:Context):Promise<InternalError>{
        if(error.status && this.has(error.status)){
            try {
                await this.get(error.status)!(error.message, context);
            } catch (e){
                return this._handle(ErrorRouting.formatError(e), context);
            }
        }

        return error;
    }

    /** Handle Error
     * 
     * Will check for handlers based on error status.
     * 
     * If not no response is sent, will check for defualt error handler.
     * 
     * @param {any} error 
     * @param {Context} context 
     */
    async handle(error:any, context:Context){
        let {status, message} = await this._handle(ErrorRouting.formatError(error), context)

        if(!context.response.commited() && this._default){
            this._default({
                status: status || "",
                message
            }, context);
        }
    }

    /** Set Error Handler
     * 
     * If no status is set, will set to default/fallback error handler.
     * 
     * @param {string|number} status 
     * @param {FormatedErrorHandler} handler 
     */
    set(status:string|number, handler:FormatedErrorHandler):this
    set(handler:DefaultErrorHandler):this
    set():this {
        switch(arguments.length){
            case 2:
                const statusType = typeof arguments[0];
                if(statusType !== "string" && statusType !== "number")
                    throw new TypeError("Error status must be a number or string!");

                if(typeof arguments[1] !== "function")
                    throw new TypeError("Error Handler must be a function!");

                super.set(arguments[0], arguments[1]);
                break;

            case 1:
                if(typeof arguments[0] !== "function")
                    throw new TypeError("Error Handler must be a function!");

                this._default = arguments[0];
                break;

            default:
                throw new Error("Invalid number of arguments to set Error Handler!");
        }

        return this;
    }
}