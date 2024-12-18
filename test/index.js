const {default:Engine, Router, View, Authorization, createElement:_} = require("../lib");
const {sleep} = require("../lib/Util");
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

app.use(Static("/Static", path.join(__dirname, "static")));

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
        head: {
            styles: "ul{ list-style: none }"
        },
        body: {
            main: _("ul",
                list.map(i=>_("li", i))
            )
        }
    })
});

BodyTest.get((ctx)=>{
    ctx.render({
        body: {
            main: _("form", {method: "POST"},
                _("label", {for: "checkbox"}, "Checkbox:"),
                _("input", {name: "checkbox", type: "checkbox", id: "checkbox"}),
                _("br"),

                _("label", {for: "color"}, "Color:"),
                _("input", {name: "color", type: "color", id: "color"}),
                _("br"),

                _("label", {for: "date"}, "Date:"),
                _("input", {name: "date", type: "date", id: "date"}),
                _("br"),

                _("label", {for: "time"}, "Time:"),
                _("input", {name: "time", type: "time", id: "time"}),
                _("br"),

                _("label", {for: "datetime-local"}, "Date Time:"),
                _("input", {name: "datetime-local", type: "datetime-local", id: "datetime-local"}),
                _("br"),

                _("label", {for: "month"}, "Month:"),
                _("input", {name: "month", type: "month", id: "month"}),
                _("br"),

                _("label", {for: "number"}, "Number:"),
                _("input", {name: "number", type: "number", id: "number"}),
                _("br"),

                _("label", {for: "range"}, "Range:"),
                _("input", {name: "range", type: "range", id: "range"}),
                _("br"),

                _("label", {for: "search"}, "Search:"),
                _("input", {name: "search", type: "search", id: "search"}),
                _("br"),

                _("label", {for: "tel"}, "Telephone:"),
                _("input", {name: "tel", type: "tel", id: "tel"}),
                _("br"),

                _("label", {for: "email"}, "Email:"),
                _("input", {name: "email", type: "email", id: "email"}),
                _("br"),

                _("label", {for: "url"}, "URL:"),
                _("input", {name: "url", type: "url", id: "url"}),
                _("br"),

                _("label", {for: "file"}, "File:"),
                _("input", {name: "file", type: "file", id: "file"}),
                _("br"),

                _("button", "Submit")
            )
        }
    })
});

app.all("/wait", async(ctx)=>{
    const number = Number(ctx.search.get("sleep"));
    if (isNaN(number) === false)
        await sleep(number);

    ctx.render({
        body: {
            main: `<a href="/wait?sleep=10000">Start</wait><br/><input /><br/><textarea></textarea><br/><button>test</button>`
        }
    });
})

http.createServer(app.server).listen(5000, ()=>{
    console.log("Test is Listening!");
})