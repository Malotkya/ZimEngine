const {default:View} = require("../build/View");
const {App} = require("../build");

test("View Init Test", ()=>{
    expect(new View()).not.toBe(undefined);
});

test("Headers Errors Test", ()=>{
    expect(()=>new View([
        {name:"Title", content:"Yes"},
        {name:"title", content:"No"}
    ])).toThrow("Multiple Title tags were given!");

    expect(()=>new View([
        {name:"Base", content:"Yes"},
        {name:"base", content:"No"}
    ])).toThrow("Multiple Base tags were given!");

    expect(()=>new View([
        {name:"meta", attributes:{name:"Author", content: "Yes"}},
        {name:"author", content:"No"}
    ])).toThrow("Multiple Meta tags with name 'author' were given!");
});

test("Render View", ()=>{
    const v = new View([
        {name:"title", content:"old title"}
    ]);

    const update = {
        head: {
            title: "New Title",
        },
        content: "<h1>Hello World</h1>"
    }

    expect(v.render(update))
        .toBe("<!DOCTYPE html><html><head><title>New Title</title><script href='/zim.js' defer=''></script></head><body><h1>Hello World</h1></body></html>")
});

test("Hosting Script Page", done=>{
    const fs = require("fs");
    const path = require("path");
    const request = require('supertest');
    const target = fs.readFileSync(path.join(__dirname, "..", "build", "view", "web.js")).toString();

    const app = new App();
    const v = new View();

    app.view(v);

    request(app.engine)
        .get(View.route)
        .expect("Content-Type", "text/javascript")
        .expect(target)
        .expect(200, done);
})

/*function defaultHead() {
    return createElement("head", 
        createElement("meta", {charset: "UTF-8"}, true),
        createElement("meta", {name: "viewport", content: "width=device-wdith, initial-scale=1"}, true),
        createElement("script", {src:"/script.js", type:"module"}),
        createElement("meta", {name:"author", content: "Alex Malotky"}),
        createElement("title", "Zim Engine")
    )
}*/