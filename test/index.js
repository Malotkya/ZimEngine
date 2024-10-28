const {default:Engine, Router, View, Authorization, createElement:_} = require("../lib");
const {default:Static} = require("../lib/Static");
const http = require("http");
const path = require("path");

const app = new Engine();
app.view(new View({},{
    title: "Zim Engine Test",
    meta: [
        {charset: "utf-8"},
        {name: "viewport", content: "width=device-width, initial-scale=1"},
    {name: "author", content: "Zim"}
    ]
}, function wireFrame(args){
    return [
        _("header", _("h1", "Hello World")),
        _("main", {id: "main"}, args["main"]),
        _("footer", _("p", "Good Bye!"))
    ]
}));
const auth = new Authorization();
auth.get(async(req)=>{
    const auth = req.headers.get("Authorization")
    if(auth===undefined)
        return null;

    const buffer = Buffer.from(auth.split(" ")[1], 'base64').toString().split(":");
    return {
        username: buffer[0],
        password: buffer[1]
    }
});
app.auth(auth);

app.use("/Static", Static(path.join(__dirname, "static")));

const home = new Router("/");
const about = new Router("/About");

home.all((ctx)=>{
    const main = [
        _("h2", "Home Page"),
        _("a", {href:"/About"}, "About Me"),
        _("a", {href:"/Bad"}, "Bad Link")
    ]

    ctx.render({
        body: {main}
    });
});

about.all((ctx)=>{
    ctx.render({
        head: {
            title: "This is updated!"
        },
        body: {
            main: [
                _("h2", "About Me"),
                _("p", "This is where I will talk about me!")
            ]
        }
    });
});

app.use(home);
app.use(about);

const login = new Router("/Auth");

login.get("/", async(ctx)=>{
    const auth = await ctx.getAuth();

    if(auth === null){
        ctx.response.headers.set('WWW-Authenticate', 'Basic realm="401"')
        ctx.status(401).text('Authentication required.');
        return;
    }
    const main = [
        _("h2", `Welcome ${auth.username}`),
    ]

    ctx.render({body: {main}})
});

app.use(login);

const BodyTest = new Router("/FormTest");
app.use(BodyTest);

BodyTest.post((ctx)=>{
    const list = [];

    for( const [key, value] of ctx.formData.entries()) {
        list.push(("p",
            `${key}: ${value}`
        ));
    }

    ctx.render({
        body: {
            main: _("section",
                list
            )
        }
    })
});

BodyTest.get((ctx)=>{
    ctx.render({
        body: {
            main: _("form", {method: "POST"},
                _("input", {name: "test"}),
                _("button", "Submit")
            )
        }
    })
})

http.createServer(app.server).listen(5000, ()=>{
    console.log("Test is Listening!");
})