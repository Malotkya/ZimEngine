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

///////////////////////////// Color Validator /////////////////////////////

test("Color Default Value", ()=>{
    expectError(()=>Validation.Color("White"), TypeError)
    const test = Validation.Color("#FFFFFF");
    expect(test.run(undefined)).toBe("#ffffff");
});

test("Color Empty Error", ()=>{
    const test = Validation.Color();
    expectError(()=>test.run(undefined), EmptyError);
    expectError(()=>test.run(null), EmptyError);
});

test("Color Conversion", ()=>{
    const test = Validation.Color();
    expect(test.run("fff")).toBe("#ffffff");
    expect(test.run("#123")).toBe("#112233");
    expect(test.run("000")).toBe("#000000");
});

///////////////////////////// Date Validator /////////////////////////////

test("Date Default Value", ()=>{
    expectError(()=>Validation.Date("January 1, 1970"), TypeError)
    const test = Validation.Date("2023-12-15");
    expect(test.run(undefined)).toBe("2023-12-15");
});

test("Date Empty Error", ()=>{
    const test = Validation.Date();
    expectError(()=>test.run(undefined), EmptyError);
    expectError(()=>test.run(null), EmptyError);
});

test("Invalid Dates", ()=>{
    const test = Validation.Date();
    expectError(()=>test.run("1-1-20202"));
    expectError(()=>test.run("2021-2-29"));
    expectError(()=>test.run("2021-1-50"));
    expectError(()=>test.run("2021-6-31"));
    expectError(()=>test.run("2024-13-1"));
})

test("Date Conversion", ()=>{
    const test = Validation.Date();
    expect(test.run("1-2-3")).toBe("0001-02-03");
    expect(test.run("45.06.7")).toBe("0045-06-07");
    expect(test.run("890.1.23")).toBe("0890-01-23");
    expect(test.run("045/6/7")).toBe("0045-06-07");
    expect(test.run("8901\\12\\30")).toBe("8901-12-30");
});

///////////////////////////// Time Validator /////////////////////////////

test("Time Default Value", ()=>{
    expectError(()=>Validation.Time("17:00:01"), TypeError)
    const test = Validation.Time("17:00");
    expect(test.run(undefined)).toBe("17:00");
});

test("Time Empty Error", ()=>{
    const test = Validation.Time();
    expectError(()=>test.run(undefined), EmptyError);
    expectError(()=>test.run(null), EmptyError);
});

test("Invalid Time", ()=>{
    const test = Validation.Time();
    expectError(()=>test.run("50:34"));
    expectError(()=>test.run("18:99"));
    expectError(()=>test.run("15:00:PM"));
});

test("Time Conversion", ()=>{
    const test = Validation.Time();
    expect(test.run("12:00:PM")).toBe("12:00");
    expect(test.run("12:00:AM")).toBe("00:00");
    expect(test.run("5:00:PM")).toBe("17:00");
    expect(test.run("10:00:AM")).toBe("10:00");
});

///////////////////////////// DateTime Validator /////////////////////////////

test("DateTime Default Value", ()=>{
    expectError(()=>Validation.DateTime("January 1, 1970 @ 5:00 PM"), TypeError)
    const test = Validation.DateTime("1970-1-1t5:00:pm");
    expect(test.run(undefined)).toBe("1970-01-01T17:00");
});

test("DateTime Empty Error", ()=>{
    const test = Validation.DateTime();
    expectError(()=>test.run(undefined), EmptyError);
    expectError(()=>test.run(null), EmptyError);
});