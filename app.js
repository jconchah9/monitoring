var WebSocketServer = require("ws").Server
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var fs = require("fs");
var Monitoring = require('./models/monitoring').Monitoring;
var api = require('./api/index');
var io = require("socket.io").listen(server);

const pg = require('pg');

function insertMonitoring(values) {
  data =  JSON.parse(values)

  data.forEach(function(value) {
      const results = [];
      v = (Math.floor(Math.random() * (value.maximum_value - value.minimum_value + 1)) + value.minimum_value);
      var monitoring = new Monitoring({sensor_id: value.id, lectura: v, date_create: new Date()});
      monitoring.save();

      pg.connect("pg://pguser:admin@agroeffect.cl:5432/agro_development", (err, client, done) => {
    // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Insert Data
        client.query('INSERT INTO Monitoring_sensors(measuring,sensor_id, sent_at, created_at,updated_at) values($1, $2,$3,$4,$5)',
        [v, value.id, new Date(),new Date(),new Date()]);
        // SQL Query > Select Data
        const query = client.query('SELECT * FROM Monitoring_sensors ORDER BY id ASC');
        // Stream results back one row at a time
        query.on('row', (row) => {
          results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', () => {
          done();
        });
      });

  });
};

function getSensors(){

  var conString = "pg://pguser:admin@localhost:5432/agro_development";
  var client = new pg.Client(conString);
  client.connect();

  var query = client.query("SELECT sensors.id, restrictions.minimum_value, restrictions.maximum_value  FROM sensors INNER JOIN monitorings ON monitorings.sensor_id = sensors.id INNER JOIN sectors ON sectors.id = monitorings.sector_id INNER JOIN restrictions ON restrictions.sector_id = sectors.id");
  query.on("row", function (row, result) {
      result.addRow(row);
  });
  query.on("end", function (result) {
      sensors = JSON.stringify(result.rows, null, "    ");
      console.log(sensors);
      insertMonitoring(sensors)
      client.end();
  });
};

//setInterval(getSensors,10000);

server.listen(5000);


io.on('connection',function (socket) {
    console.log('alguien se conecto');
});

app.set("view engine","jade");
app.use("/public",express.static('public'));
app.use('/api',api);

var messages = [{
  id: 1,
  text: '...',
  author: 'AGROEFFECT'
}];

io.on('connection', function(socket) {
    console.log('Alguien se ha conectado con Sockets');
    socket.emit('messages', messages);

    socket.on('new-message', function(data) {
      messages.push(data);

      var monitoring = new Monitoring({sensor_id:variable[0],lectura:variable[1],date_create:new Date()});

      monitoring.save();
      io.sockets.emit('lectura', monitoring);
    });
});
