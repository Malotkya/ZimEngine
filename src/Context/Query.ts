/** /Context/Query
 * 
 * @author Alex Malotky
 */
import {D1Database} from "@cloudflare/workers-types";
import { Object, Simple } from "../Validation/Type";
import DataObject, { TypeOf, DataConstraints, ObjectProperties,  } from "../Validation";

/** Database Query Builder
 * 
 * Currntly only works with Cloudflare D1Database
 */
export default class Query {
    #db:D1Database|undefined;

    constructor(env:Env) {
        for(const name in env){
            if(env[name] instanceof D1Database){
                this.#db = env[name];
                break;
            }
        }
    }

    private get db():D1Database {
        if(this.#db === undefined)
            throw new Error("No database connection!");

        return this.#db;
    }

    /** Insert Value into Database
     * 
     * @param {ObjectValidator} validator 
     * @param {Object} value 
     */
    async insert<P extends ObjectProperties>(object:DataObject<P>, value:Object<keyof P>):Promise<void> {
        const [string, values] = object.buildInsertValues(value);

        await this.db.prepare(`INSERT INTO ${object.name}${string}`)
            .bind(...values).run();
    }

    /** Update Value in Database
     * 
     * @param {ObjectValidator} validator 
     * @param {Object} value 
     * @param {ObjectDefaults} constraints
     */
    async update<P extends ObjectProperties>(object:DataObject<P>, value:Object<keyof P>, constraints?:DataConstraints<keyof P>):Promise<void>{
        const [updateString, updateValues] = object.buildUpdateValues(value);
        const [constraintString, constraintValues] = object.buildConstraints(constraints);

        await this.db.prepare(`UPDATE ${object.name} ${updateString} ${constraintString}`)
                .bind(...updateValues.concat(constraintValues)).run();
    }

    /**
     * 
     */
    async delete<P extends ObjectProperties>(object:DataObject<P>, constraints?:DataConstraints<keyof P>):Promise<void> {
        const [string, values] = object.buildConstraints(constraints);

        await this.db.prepare(`DELETE FROM ${object.name} ${string}`)
                .bind(...values).run();
    }

    /** Get First Value from Database
     * 
     * @param {ObjectValidator} validator 
     * @param {ObjectDefaults} constraints
     */
    async get<P extends ObjectProperties>(object:DataObject<P>, constraints?:DataConstraints<keyof P>):Promise<TypeOf<DataObject<P>>|null> {
        const [string, values] = object.buildConstraints(constraints); 

        const result:TypeOf<DataObject<P>>|null = await this.db.prepare(`SELECT * FROM ${object.name} ${string}`)
                        .bind(...values).first();
        
        if(result === null)
            return null;

        return object.run(result);
    }

    /** Get ALl Values from Database
     * 
     * @param {ObjectValidator} validator 
     * @param {ObjectDefaults} constraints
     */
    async getAll<P extends ObjectProperties>(object:DataObject<P>, constraints?:DataConstraints<keyof P>):Promise<TypeOf<DataObject<P>>[]> {
        const [string, values] = object.buildConstraints(constraints); 

        const {results, error} = await this.db.prepare(`SELECT * FROM ${object.name} ${string}`)
                        .bind(...values).all();

        if(error)
            throw error;

        return results.map((v)=>object.run(v));
    }
}