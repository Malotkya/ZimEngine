import {test, expect} from '@jest/globals';
import {Validation} from "../lib";

test("Boolean", ()=>{
    let bool = Validation.boolean(true);

    expect(bool.format(undefined)).toBe(true);

    bool = Validation.boolean();

    //expect(bool.format()).toThrow()
})