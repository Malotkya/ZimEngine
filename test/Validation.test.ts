import {test, expect} from '@jest/globals';
import {Validation} from "../lib";
import { EmptyError } from '../lib/Validation/Type/Empty';
import { expectError } from './Validation.Types.test';


///////////////////////////// Optional Validator /////////////////////////////

test("Optional Primitive Value", ()=>{
    const test = Validation.Optional(Validation.string());
    expect(test.run(undefined)).toBe(null);
    expect(test.run("Hello, World")).toBe("Hello, World");
});

test("Optional Default Value", ()=>{
    const test = Validation.Optional(Validation.Time(), "5:00:PM");
    expect(test.run(null)).toBe("17:00");
});

test("Optional Stored Value", ()=>{
    const test = Validation.Optional(Validation.Color());
    expect(test.run(null)).toBe(null);
    expect(test.run("AAA")).toBe("#aaaaaa");
});

///////////////////////////// List Validator /////////////////////////////

test("List Primitive Value", ()=>{
    const test = Validation.List(Validation.number());
    expect(test.run("[]")).toEqual([]);
    expect(test.run([1, 2, 3])).toEqual([1, 2, 3]);
});

test("List Default Value", ()=>{
    const test = Validation.List(Validation.Date(), ["1970/1/1"]);
    expect(test.run(null)).toEqual(["1970-01-01"]);
});

test("List Stored Value", ()=>{
    const start = ["test@real.com"];
    const test = Validation.List(Validation.Email(), start);
    expect(test.run(null)).toEqual(start);
    expect(test.run(["one@new.com", "two@new.com"])).not.toEqual(start);
    expect (test.run('["test@real.com"]')).toEqual(start);
});

///////////////////////////// Object Validator /////////////////////////////

test("Object Value", ()=>{
    const test = Validation.Object({
        name: Validation.string(),
        age: Validation.number(),
        email: Validation.Email(),
        portfolio: Validation.Optional(Validation.Url())
    });
    const value = {
        name: "Alex",
        age: "32",
        email: "Alex@email.com"
    };

    expect(test.run(value)).toEqual({
        name: "Alex",
        age: 32,
        email: "alex@email.com",
        portfolio: null
    });
});