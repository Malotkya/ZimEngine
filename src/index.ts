import http from 'http';
import App, {Router, Context} from "./App";

const app:App = new App();

const test:Router = new Router();

test.all((ctx:Context)=>{
    ctx.response.writeHead(200, {'Content-Type': 'text/plain'});
    ctx.response.write("Hello World!");
    ctx.response.end();
});

app.use("/", test);

http.createServer(app.engine).listen(5000, ()=>{
    console.log("This is working!");
});