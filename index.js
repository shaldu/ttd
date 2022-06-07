const Express = require("express");
const ejs = require("ejs");
const path = require("path");
const THREE = require("three");
const { json } = require("express");
const { stringify } = require("querystring");
const { log } = require("console");
const app = Express();
const server = require('http').createServer(app);
const escape = require('escape-html');


const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000",
    },
});
const port = 3000;

//Template Engine
app.set('view engine', 'ejs');

//middleware && static files
app.use(Express.static(__dirname + '/public'));
app.use(Express.static(__dirname + '/node_modules'));

//socket IO
function socketEvents() {
    io.once('connection', client => {

    });
}

//Home
app.get('/', (req, res, next) => {
    socketEvents()
    res.render('index');
});

//Error page
app.use((req, res) => {
    const data = {

    }
    res.status(404).render('error', data);
});

console.log(`Server is running on http://localhost:3000`);
server.listen(port);