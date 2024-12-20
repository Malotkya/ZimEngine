/** /Authorization
 * 
 * @author Alex Malotky
 */
import OutgoingResponse from "./Context/OutgoingResponse"
import IncomingRequest from "./Context/IncomingRequest";

//Get Authorization Type
export type AuthGet = (request:IncomingRequest) => Promise<User|null>|User|null;

//Set Authorization Type
export type AuthSet = (response:OutgoingResponse, user:User|null) => Promise<void>|void;

/** Authorization Interface
 * 
 */
export default class Authorization{
    private _getter:AuthGet|undefined;
    private _setter:AuthSet|undefined;

    /** Set Authroization Function
     * 
     * @param {AuthSet} value 
     */
    set(value:AuthSet):void
    set():AuthSet
    set():AuthSet|void{
        if(arguments.length === 0){
            if(this._setter)
                return this._setter;
            else
                throw new Error("Authentication Setter was never set!");
        }

        if(typeof arguments[0] !== "function")
            throw new TypeError("Authentication Setter must be a function!");

        this._setter = arguments[0];
    }

    /** Get Authroization Function
     * 
     * @param {AuthSet} value 
     */
    get(value:AuthGet):void
    get():AuthGet
    get():AuthGet|void{
        if(arguments.length === 0){
            if(this._getter)
                return this._getter;
            else
                throw new Error("Authentication Getter was never set!");
        }

        if(typeof arguments[0] !== "function")
            throw new TypeError("Authentication Getter must be a function!");

        this._getter = arguments[0];
    }
}