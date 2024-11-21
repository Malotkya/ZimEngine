import {test} from '@jest/globals';
import App from "../lib";
import Static from "../lib/Static"
import request from "supertest";
import fs from "fs";
import path from "path";

const staticDir = path.join(__dirname, "static");

const app = new App();
app.use(Static("/", staticDir));

test("Static .txt File", done=>{
    const fileName = "/file.txt";
    const file = fs.readFileSync(path.join(staticDir, fileName)).toString();

    request(app.server)
        .get(fileName)
        .expect("Content-Type", "text/plain")
        .expect(file)
        .expect(200, done);
});

test("Static .png File", done=>{
    const fileName = "/Smile.png";
    const file = fs.readFileSync(path.join(staticDir, fileName)).toString();

    request(app.server)
        .get(fileName)
        .expect("Content-Type", "image/png")
        /*.expect(file)*/
        .expect(200, done);
});

test("Static 404 Error", done=>{

    request(app.server)
        .get("/Bad")
        .expect(404, done);
});