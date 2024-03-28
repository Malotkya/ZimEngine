const {App, Router, View} = require("../build");
const {createElement:_} = require("../build/View/Html");
const http = require("http");

const app = new App();
app.view(new View([
    {name: "charset", attributes: {charset: "UTF-8"} },
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

/*const login = new Router();

login.all((ctx)=>{
    const authorization = ctx.request.headers.authorization;
    console.log(authorization);
    if(!authorization) {
        throw 401;
    }
});

login.get("/User", (ctx)=>{
    ctx.write("<h1>Welcome ${username}</h1>");
});

app.use("/Auth", login);
app.use("/", (ctx)=>{
    ctx.write("<h1>Hello World</h1>");
});*/

http.createServer(app.engine).listen(5000, ()=>{
    console.log("Test is Listening!");
})