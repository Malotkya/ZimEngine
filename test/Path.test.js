const Path_1 = require("../build/Path");
const Path = Path_1["default"];

test("Shortcut Test", ()=>{
    const path = new Path("*");

    expect(path.match("/A/Really/Long/Path")).not.toBe(null)
});

test("Fail Test", ()=>{
    const path = new Path("/");

    expect(path.match("/A/Really/Long/Path")).toBe(null)
});

test("Blank Partail Match", ()=>{
    const path = new Path("/", true);

    expect(path.match("/A/Really/Long/Path")).not.toBe(null)
})

test("Partial Match", ()=>{
    const test = new Path("/Home", true);
    const uri = "/Home/User/Info";
    const expected = "/User/Info";

    const {path} = test.match(uri)
    expect(path.value).toBe(expected);
});

test("Params Match", ()=>{
    const test = new Path("/User/:id");
    const id = "12345";

    const {params} = test.match(`/User/${id}`);
    expect(params.id).toBe(id);
});

test("Undefined Partial Params Match", ()=>{
    const test = new Path("/User/:id/:opt?");
    const id = "12345";

    const {params} = test.match(`/User/${id}`);
    expect(params.id).toBe(id);
    expect(params.opt).toBe(undefined);
})