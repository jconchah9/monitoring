var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io").listen(server);
var fs = require("fs");

var Monitoring = require('./models/monitoring').Monitoring;
var api = require('./api/index');


io.on("connection",function (socket) {
    console.log("alguien se conecto");
});


app.set("view engine","jade");
app.use("/public",express.static('public'));
app.use('/api',api);

var messages = [{
    id: 1,
    text: "Hola soy un mensaje del servidor",
    author: "Juan Carlos Concha"
}];
io.on('connection', function(socket) {
    console.log('Alguien se ha conectado con Sockets');
    socket.emit('messages', messages);

    socket.on('new-message', function(data) {
        messages.push(data);
        console.log(data);        

        var limpiar = data.replace("\r","")
        var variable =limpiar.split(",");
        var json ={
            s1:variable[0],
            s2:variable[1],
            d: new Date()
        }
        var monitoring = new Monitoring({sensor_id:variable[0],lectura:variable[1],date_create:new Date()});
        monitoring.save();
        io.sockets.emit('lectura', monitoring);
        fs.appendFile("./public/data/data.json",JSON.stringify(json)+"\r\n");

    });
});



server.listen(8080);
