/** /Context/Query
 * 
 * @author Alex Malotky
 */
import { Object as ObjectValue } from "../Validation/Type";
import DataObject, { TypeOf, DataConstraints, ObjectProperties } from "../Validation";

//Query Filter Constraints
interface QueryConstraints<P extends ObjectProperties> {
    groupBy?: Array<keyof P>,
    orderBy?: {[k in keyof P]?: "ASC"|"DESC"},
    limit?:number,
    offset?:number
}

/** Build Group By String
 * 
 * @param {Array} value 
 * @returns {string}
 */
function buildGroupByString<P extends ObjectProperties>(value:Array<keyof P>):string {
    if(value.length === 0)
        return "";

    return "ORDER BY " + value.filter((v, i, self)=>self.indexOf(v, i)===i).join(", ");
}

/** Build Order By String
 * 
 * @param {Record} value 
 * @returns {String}
 */
function buildOrderByString<P extends ObjectProperties>(value:{[k in keyof P]?: "ASC"|"DESC"}):string {
    if(Object.getOwnPropertyNames(value).length === 0)
        return "";

    let string = "ORDER BY ";
    for(const name in value) {
        string += name + " " + value[name] + ", ";
    }

    return string.substring(0, string.length-2);
}

/** Build Query Filter String
 * 
 * @param {QueryConstraints} constraints 
 * @returns {string}
 */
function buildFilterString<P extends ObjectProperties>(constraints:QueryConstraints<P> = {}):string {
    const {groupBy, orderBy, limit, offset} = constraints;
    let output:string = "";

    if(groupBy)
        output += buildGroupByString(groupBy) + " ";
    
    if(orderBy)
        output += buildOrderByString(orderBy) + " ";

    if(limit)
        output += `LIMIT ${limit} `; 
    

    if(offset)
        output += `OFFSET ${offset}`;
    

    return output;
}

/** Database Query Builder
 * 
 * Currntly only works with Cloudflare D1Database
 */
export default class QueryBuilder<P extends ObjectProperties> {
    private _db:D1Database|undefined;
    private _obj:DataObject<P>;

    constructor(db:D1Database, object:DataObject<P>) {
        this._db = db;
        this._obj = object;
    }

    private get db():D1Database {
        if(this._db === undefined)
            throw new Error("No database connection!");

        return this._db;
    }

    /** Insert Value into Database
     * 
     * @param {Object} value 
     */
    async insert(value:ObjectValue<keyof P>):Promise<void> {
        const [string, values] = this._obj.buildInsertValues(value);

        const query = `INSERT INTO ${this._obj.name}${string}`;
        await this.db.prepare(query).bind(...values).run();
    }

    /** Update Value in Database
     * 
     * @param {Object} value 
     * @param {ObjectDefaults} constraints
     */
    async update(value:ObjectValue<keyof P>, constraints?:DataConstraints<keyof P>):Promise<void>{
        const [updateString, updateValues] = this._obj.buildUpdateValues(value, Object.getOwnPropertyNames(constraints));
        const [constraintString, constraintValues] = this._obj.buildConstraints(constraints);

        const query = `UPDATE ${this._obj.name} ${updateString} ${constraintString}`;
        await this.db.prepare(query).bind(...updateValues.concat(constraintValues)).run();
    }

    /** Delete Value in Database
     * 
     */
    async delete(constraints?:DataConstraints<keyof P>):Promise<void> {
        const [string, values] = this._obj.buildConstraints(constraints);

        const query = `DELETE FROM ${this._obj.name} ${string}`;
        await this.db.prepare(query).bind(...values).run();
    }

    /** Get First Value from Database
     * 
     * @param {ObjectDefaults} constraints
     */
    async get(constraints?:DataConstraints<keyof P>):Promise<TypeOf<DataObject<P>>|null> {
        const [string, values] = this._obj.buildConstraints(constraints); 

        const query = `SELECT * FROM ${this._obj.name} ${string}`;
        const result:TypeOf<DataObject<P>>|null = await this.db.prepare(query).bind(...values).first();
        
        if(result === null)
            return null;

        return this._obj.run(result);
    }

    /** Get ALl Values from Database
     * 
     * @param {ObjectDefaults} constraints
     */
    async getAll(constraints?:DataConstraints<keyof P>, filter?:QueryConstraints<P>):Promise<TypeOf<DataObject<P>>[]> {
        const [string, values] = this._obj.buildConstraints(constraints); 
        const filterString = buildFilterString(filter);

        const query = `SELECT * FROM ${this._obj.name} ${string} ${filterString}`;
        const {results, error} = await this.db.prepare(query).bind(...values).all();

        if(error)
            throw error;

        return results.map((v)=>this._obj.run(v));
    }
}