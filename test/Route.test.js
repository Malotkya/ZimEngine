const {default:App, Router} = require("../lib");
const {default:Route} = require("../lib/Routing/Route");
const {default:Layer} = require("../lib/Routing/Layer");
const request = require('supertest');

const app = new App();
const route = new Route();
const home = new Router();


const Really = new Route("/Really");
Really.use(new Layer("/Deep", (ctx)=>{
    ctx.text("Good Job!");
}));
app.use("/Go", Really);

const message = {
    value:"Hello World!"
}

home.all((ctx)=>{
    ctx.json(message);
});

app.use("/", home);

app.use("/:one/:two/:three", (ctx)=>{
    if(ctx.params["one"] === "Go")
        return; //Im just lazy here.

    const params = [
        ctx.params.get("one"),
        ctx.params.get("two"),
        ctx.params.get("three")
    ];

    const search = [
        ctx.search.get("one"),
        ctx.search.get("two"),
        ctx.search.get("three")
    ];

    ctx.json({params, search});
});

route.use("/Hello", 
    (ctx)=>ctx.text("Hello World\n")
);
app.use(route);

test("Init Test", done => {
    request(app.server)
        .get("/")
        .expect("Content-Type", "application/json")
        .expect(message)
        .expect(200, done);
});

test("Params & Search Variables", done => {
    const params = [
        "I",
        "Stop",
        "At"
    ]

    const search = [
        "This",
        "Is",
        "Different"
    ]

    const uri = `/${params.join("/")}?one=${search[0]}&two=${search[1]}&three=${search[2]}`;

    request(app.server)
        .get(uri)
        .expect({params, search})
        .expect(200, done);
});

test("Simple Routing Test", done => {
    request(app.server)
        .get("/Hello")
        .expect("Content-Type", "text/plain")
        .expect("Hello World\n")
        .expect(200, done);
})

test("404 Test", done => {
    request(app.server)
        .get("/Bad/Link")
        .expect(404, done);
});

test("Deep Router Test", done=>{
    request(app.server)
        .get("/Go/Really/Deep")
        .expect("Content-Type", "text/plain")
        .expect("Good Job!")
        .expect(200, done);
})



