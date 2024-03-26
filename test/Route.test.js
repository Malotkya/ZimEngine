const {App, Route} = require("../build");
const request = require('supertest');

const app = new App();
const route = new Route();

const message = {
    value:"Hello World!"
}

app.use("/", (ctx)=>{
    ctx.json(message);
});

app.use("/:one/:two/:three/:four?", (ctx)=>{
    const params = [
        ctx.params["one"],
        ctx.params["two"],
        ctx.params["three"],
        ctx.params["four"]
    ];

    const search = [
        ctx.search["one"],
        ctx.search["two"],
        ctx.search["three"]
    ];

    ctx.json({params, search});
});

route.use("/Hello", 
    (ctx)=>ctx.text("Hello World\n"),
    (ctx)=>ctx.text("Hola Mundo\n")
)

test("Init Test", done => {
    request(app.engine)
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

    params.push(null);

    request(app.engine)
        .get(uri)
        .expect({params, search})
        .expect(200, done);
});

test("Complex Routing Test", done => {
    request(app.engine)
        .get("/Hello")
        .expect("Hello World\nHola Mundo\n")
        .expect(200, done);
})

test("404 Test", done => {
    request(app.engine)
        .get("/Bad/Link")
        .expect(404, done);
});



