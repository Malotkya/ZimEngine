const {default:App} = require("../build/App");
const {default:Static} = require("../build/Static");
const request = require('supertest');
const fs = require("fs");
const path = require("path");

const staticDir = path.join(__dirname, "static");

const app = new App();
app.use(Static(staticDir));

test("Static .txt File", done=>{
    const fileName = "/file.txt";
    const file = fs.readFileSync(path.join(staticDir, fileName)).toString();

    request(app.engine)
        .get(fileName)
        .expect("Content-Type", "text/plain")
        .expect(file)
        .expect(200, done);
});

test("Static .png File", done=>{
    const fileName = "/Smile.png";
    const file = fs.readFileSync(path.join(staticDir, fileName)).toString();

    request(app.engine)
        .get(fileName)
        .expect("Content-Type", "image/png")
        .expect(200, done);
});

test("Static .mp4 File", done=>{
    const fileName = "/TEST VIDEO.mp4";
    //TODO: Get video streaming working!
    //const file = fs.readFileSync(path.join(staticDir, fileName)).toString();

    request(app.engine)
        .get(fileName)
        .expect("Content-Type", "video/mp4")
        .expect(200, done);
});

test("Static 404 Error", done=>{

    request(app.engine)
        .get("/Bad")
        .expect(404, done);
});