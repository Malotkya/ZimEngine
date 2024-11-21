import {test, expect} from '@jest/globals';
import App, {View} from "../src";

const {version} = require("../package.json");

test("View Init Test", ()=>{
    expect(new View()).not.toBe(undefined);
});

test("Render View", ()=>{
    const v = new View(undefined, {title: "Global Title"}, (args)=>`${args.main}`);

    const update = {
        head: {
            title: "New Title",
        },
        body: {
            main:"<h1>Hello World</h1>"
        }
    }

    expect(v.render(update))
        .toBe(`<!DOCTYPE html><html><head><title>Global Title | New Title</title><script src=\"/zim.js?${version}\" defer></script></head><body><h1>Hello World</h1></body></html>`)
});

test("Hosting Script Page", done=>{
    const fs = require("fs");
    const path = require("path");
    const request = require('supertest');
    const target = fs.readFileSync(path.join(__dirname, "..", "lib", "View", "Web.js")).toString()
                    .replace('Object.defineProperty(exports, "__esModule", { value: true });', '');

    const app = new App();
    const v = new View();

    app.view(v);

    request(app.server)
        .get(View.injectFilePath)
        .expect("Content-Type", "text/javascript")
        .expect(target)
        .expect(200, done);
})