/** /Validation
 * 
 * @author Alex Malotky
 */
import { ObjectProperties, ObjectDefaults, ObjectValidator, Simple, isEmpty, Object } from "zim-validation";
export { boolean, number, string, empty, color, date, datetime, email, telephone, time, url, list, object, optional, record, TypeOf, Optional} from "zim-validation";

export type DataConstraints<K extends string|number|symbol> = ObjectDefaults<K>;
export {ObjectProperties, Object};

/** Data Object 
 * 
 */
export default class DataObject<P extends ObjectProperties> extends ObjectValidator<P> {
    private _table:string;
    

    constructor(tableName:string, properties:P) {
        super(properties, undefined, false);
        this._table = tableName;
    }

    /** Get Table Name
     * 
     */
    get name():string {
        return this._table;
    }

    /** Build Constraints
     * 
     * @param {DataConstraints} constraints 
     * @returns {Array}
     */
    async buildConstraints(constraints?:DataConstraints<keyof P>):Promise<[string, Simple[]]>{
        if(isEmpty(constraints))
            return ["", []];

        let string = "WHERE ";
        const values:Array<Simple> = []
        for(const name in constraints) {
            string += name + " = ? AND"
            values.push(await this._props[name].simplify(constraints[name]));
        }

        return [string.substring(0, string.length-3), values];
    }

    /** Build Insert
     * 
     * @param {Object} value 
     * @returns {Array}
     */
    async buildInsertValues(value:Object<P>):Promise<[string, Simple[]]>{
        let queryNames:string = "(";
        let queryValues:string = "VALUES(";
        const values:Array<Simple> = [];

        for(const name in value) {
            queryNames  += name + ", ";
            queryValues += "?, ";
            values.push(await this._props[name].simplify(value[name]));
        }

        return [`${queryNames.substring(0, queryNames.length-2)}) ${queryValues.substring(0, queryValues.length-2)})`, values]
    }

    /** Build Update
     * 
     * @param {Object} value 
     * @param {Array} constraints
     * @returns {Array}
     */
    async buildUpdateValues(value:Object<P>, constraints:(keyof P)[]):Promise<[string, Simple[]]> {
        let string:string = "SET ";
        const values:Array<Simple> = [];

        for(const name in value) {
            const simple = await this._props[name].simplify(value[name]);
            //!(constraints.includes(name) && isEmpty(simple))
            if( !isEmpty(simple) || !constraints.includes(name) ) {
                string  += name + " = ?, ";
                values.push(simple);
            }
            
        }

        return [string.substring(0, string.length-2), values];
    }
}