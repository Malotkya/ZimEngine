const {default:HtmlDcoument, createContent:_} = require("../lib/View/Html");

test("HTTP: Single Normal Element", ()=>{
    expect(_("a", {href:"/link"}, "Basic Link"))
        .toBe("<a href='/link'>Basic Link</a>");
});

test("HTTP: Single Self Closed Element", ()=>{
    expect(_("input", {name:"txtName", value:"UserName"}, true))
        .toBe("<input name='txtName' value='UserName'/>");
});

test("HTTP: Object for child element", ()=>{
    const list = [];
    for(let i=0; i<5; i++){
        list.push(_("li", i))
    }
    expect(_("ol", list))
        .toBe("<ol><li>0</li><li>1</li><li>2</li><li>3</li><li>4</li></ol>");
});

test("HTTP: Self close overide", ()=>{
    expect(_("parent", true,
        _("child", true)
    )).toBe("<parent><child/></parent>");
});

test("HTTP: Null Child", ()=>{
    expect(_("null", null)).toBe("<null></null>");
});

test("HTTP Document Test", ()=>{
    expect(HtmlDcoument({}, _("title", "Test"), _("h1", "Hello World")))
        .toBe("<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello World</h1></body></html>")
})
