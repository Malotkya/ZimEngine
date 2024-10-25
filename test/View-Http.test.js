const {createElement:_} = require("../lib");
const {HtmlDocument} = require("../lib/View/Html");
const {compileElement} = require("../lib/View/Html/Element");

test("HTTP: Single Normal Element", ()=>{
    const element = _("a", {href:"/link"}, "Basic Link");

    expect(compileElement(element))
        .toBe("<a href=\"/link\">Basic Link</a>");
});

test("HTTP: Single Self Closed Element", ()=>{
    const element = _("input", {name:"txtName", value:"UserName"});

    expect(compileElement(element))
        .toBe("<input name=\"txtName\" value=\"UserName\"/>");
});

test("HTTP: Object for child element", ()=>{
    const list = [];
    for(let i=0; i<5; i++){
        list.push(_("li", i))
    }

    expect(compileElement(_("ol", list)))
        .toBe("<ol><li>0</li><li>1</li><li>2</li><li>3</li><li>4</li></ol>");
});

test("HTTP: Null Child", ()=>{
    const element = _("null", null);

    expect(compileElement(element)).toBe("<null></null>");
});

test("HTTP Document Test", ()=>{
    expect(HtmlDocument({}, {title: "Test"}, _("h1", "Hello World")))
        .toBe("<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello World</h1></body></html>")
})
