import {test, expect} from '@jest/globals';
import {Validation} from "../lib";
import { EmptyError } from '../lib/Validation/Type/Empty';

function expectError(test:Function, error?:Function) {
    let value:any;
    try {
        test()
    } catch(e:any) {
        value = e;
        if(error)
            expect(e).toBeInstanceOf(error);
    }
    expect(value).not.toBe(undefined);
}

///////////////////////////// Boolean Validator /////////////////////////////

test("Boolean Default Value", ()=>{
    const test = Validation.boolean(true);
    expect(test.run(undefined)).toBe(true);
});

test("Boolean Empty Error", ()=>{
    const test = Validation.boolean();
    expectError(()=>test.run(undefined), EmptyError);
});

test("Boolean Strings", ()=>{
    const test = Validation.boolean();
    expect(test.run("True")).toBe(true);
    expect(test.run("False")).toBe(false);
    expect(test.run("Really False")).toBe(false);

    expect(test.run("1")).toBe(true);
    expect(test.run("0")).toBe(false);
});

test("Boolean Numbers", ()=>{
    const test = Validation.boolean();
    expect(test.run(1)).toBe(true);
    expect(test.run(0)).toBe(false);
    expect(test.run(537)).toBe(false);
    expect(test.run(1n)).toBe(true);
    expect(test.run(2n)).toBe(false);
});

test("Boolean Objects", ()=>{
    const test = Validation.boolean();
    expect(test.run(null)).toBe(false);
    expectError(()=>test.run({}), TypeError);
});

///////////////////////////// Number Validator /////////////////////////////

test("Number Default Value", ()=>{
    const test = Validation.number(21);
    expect(test.run(undefined)).toBe(21);
    expect(test.run(null)).toBe(21);
});

test("Number Empty Error", ()=>{
    const test = Validation.number();
    expectError(()=>test.run(undefined), EmptyError);
});

test("Valid Numbers", ()=>{
    const test = Validation.number();
    expect(test.run(1)).toBe(1);
    expect(test.run("53")).toBe(53);
    expect(test.run(6n)).toBe(6);
});

test("Invalid Numbers", ()=>{
    const test = Validation.number();
    expectError(()=>test.run("1,000"));
    expectError(()=>test.run({}));
    expectError(()=>test.run(null), EmptyError);
});

///////////////////////////// String Validator /////////////////////////////

test("String Default Value", ()=>{
    const test = Validation.string("Hello, World");
    expect(test.run(undefined)).toBe("Hello, World");
});

test("String Empty Error", ()=>{
    const test = Validation.string();
    expectError(()=>test.run(undefined), EmptyError);
    expectError(()=>test.run(null), EmptyError);
});

test("String Convertion Test", ()=>{
    const test = Validation.string();
    expect(test.run(1)).toBe("1");
    expect(test.run(21n)).toBe("21");
    expect(test.run(true)).toBe("true");
    expect(test.run(false)).toBe("false");
    expect(test.run({})).toBe("{}");
    expect(test.run([])).toBe("[]");
});