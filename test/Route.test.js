const {App} = require("../build");
const request = require('supertest');

const app = new App();

const message = {
    value:"Hello World!"
}

app.use("/Test", (ctx)=>{
    ctx.json(message);
});

test("Init Test", done => {
    request(app.engine)
        .get("/Test")
        .expect("Content-Type", "application/json")
        .expect(message)
        .expect(200, done);
})