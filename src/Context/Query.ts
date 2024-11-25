/** /Context/Query
 * 
 * @author Alex Malotky
 */
import {D1Database} from "@cloudflare/workers-types";
import ObjectValidator, {ObjectProperties, ObjectDefaults} from "../Validation/Object";
import { Object, Simple } from "../Validation/Type";
import { TypeOf } from "../Validation";

/** Database Query Builder
 * 
 * Currntly only works with Cloudflare D1Database
 */
export default class Query {
    #db:D1Database;
    private _table:string;

    constructor(table:string, db:D1Database) {
        this.#db = db;
        this._table = table;
    }

    /** Insert Value into Database
     * 
     * @param {ObjectValidator} validator 
     * @param {Object} value 
     */
    async insert<P extends ObjectProperties>(validator:ObjectValidator<P>, value:Object<keyof P>):Promise<void> {
        let queryNames:string = this._table + "(";
        let queryValues:string = "VALUES(";
        const values:Array<Simple> = [];

        for(const name in value) {
            queryNames  += name + ", ";
            queryValues += "?, ";
            values.push(validator.get(name).simplify(value[name]));
        }

        await this.#db.prepare(`INSERT INTO ${this._table}${queryNames.slice(-2)}) ${queryValues.slice(-2)})`)
            .bind(...values).run();
        
    }

    /** Update Value in Database
     * 
     * @param {ObjectValidator} validator 
     * @param {Object} value 
     * @param {ObjectDefaults} constraints
     */
    async update<P extends ObjectProperties>(validator:ObjectValidator<P>, value:Object<keyof P>, constraints?:ObjectDefaults<keyof P>):Promise<void>{
        let queryNames:string = "SET ";
        const values:Array<Simple> = [];

        for(const name in value) {
            queryNames  += name + " = ?, ";
            values.push(validator.get(name).simplify(value[name]));
        }

        let constraintNames:string = "";
        if(constraints) {

            constraintNames = "WHERE ";
            for(const name in constraints) {
                constraintNames += name + " = ? AND"
                values.push(validator.get(name).simplify(constraints[name]));
            }

            constraintNames = constraintNames.slice(-3);
        }

        await this.#db.prepare(`UPDATE ${this._table} ${queryNames} ${constraintNames}`)
                .bind(...values).run();
    }

    /** Get First Value from Database
     * 
     * @param {ObjectValidator} validator 
     * @param {ObjectDefaults} constraints
     */
    async get<P extends ObjectProperties>(validator:ObjectValidator<P>, constraints?:ObjectDefaults<keyof P>):Promise<TypeOf<ObjectValidator<P>>|null> {
        let constraintNames:string = "";
        const values:Array<Simple> = [];

        if(constraints) {

            constraintNames = "WHERE ";
            for(const name in constraints) {
                constraintNames += name + " = ? AND"
                values.push(validator.get(name).simplify(constraints[name]));
            }

            constraintNames = constraintNames.slice(-3);
        }

        const result:TypeOf<ObjectValidator<P>>|null = await this.#db.prepare(`SELECT * FROM ${this._table} ${constraintNames}`)
                        .bind(...values).first();
        
        if(result === null)
            return null;

        for(const name in result){
            result[name] = validator.get(name).run(result[name]);
        }

        return result;
    }

    /** Get ALl Values from Database
     * 
     * @param {ObjectValidator} validator 
     * @param {ObjectDefaults} constraints
     */
    async getAll<P extends ObjectProperties>(validator:ObjectValidator<P>, constraints?:ObjectDefaults<keyof P>):Promise<TypeOf<ObjectValidator<P>>[]> {
        let constraintNames:string = "";
        const values:Array<Simple> = [];

        if(constraints) {

            constraintNames = "WHERE ";
            for(const name in constraints) {
                constraintNames += name + " = ? AND"
                values.push(validator.get(name).simplify(constraints[name]));
            }

            constraintNames = constraintNames.slice(-3);
        }

        const output:TypeOf<ObjectValidator<P>>[] = []
        const {results, error} = await this.#db.prepare(`SELECT * FROM ${this._table} ${constraintNames}`)
                        .bind(...values).all();

        if(error)
            throw error;

        for(const result of results){
            for(const name in result){
                result[name] = validator.get(name).run(result[name]);
            }

            output.push(result as any);
        }

        return output;
    }
}