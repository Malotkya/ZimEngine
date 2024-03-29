const {App, Router, View} = require("../build");
const {createElement:_} = require("../build/View/Html");
const {default:Static} = require("../build/Static");
const http = require("http");
const path = require("path");

const app = new App();
app.view(new View([
    {name: "charset", content:"UTF-8"},
    {name: "viewport", content: "width=device-wdith, initial-scale=1"},
    {name: "author", content: "Zim"},
    {name: "title", content: "Zim Engine Test"}
], function wireFrame(content){
    return [
        _("header", _("h1", "Hello World")),
        _("main", content),
        _("footer", _("p", "Good Bye!"))
    ]
}));
app.use("/Static", Static(path.join(__dirname, "static")));

const home = new Router();
const about = new Router();

home.all((ctx)=>{
    const content = [
        _("h2", "Home Page"),
        _("a", {href:"/About"}, "About Me")
    ]

    ctx.render({content})
});

about.all((ctx)=>{
    const content = [
        _("h2", "About Me"),
        _("p", "This is where I will talk about me!")
    ]

    ctx.render({content});
});

app.use("/", home);
app.use("/About", about);

const login = new Router();

login.auth("ZimEngine");
login.get("/", (ctx)=>{
    const auth = ctx.authorization();
    const content = [
        _("h2", `Welcome ${auth.username}`),
    ]

    ctx.render({content})
});

app.use("/Auth", login);

http.createServer(app.engine).listen(5000, ()=>{
    console.log("Test is Listening!");
})