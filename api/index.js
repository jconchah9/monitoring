var express = require("express");
var router = express.Router();
var Monitoring = require('../models/monitoring').Monitoring;
var cors = require('cors');
var bodyParser = require('body-parser')
const pg = require('pg');
/* REST */
router.use(cors());
router.use(bodyParser.urlencoded());
router.route("/monitorings")
.post(function(req,res) {

	var results = [];
	var monitoring = new Monitoring({sensor_id: req.body.sensor_id, lectura: req.body.value, date_create: new Date(req.body.sent_at)});
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
		[req.body.value, req.body.sensor_id, new Date(req.body.sent_at),new Date(req.body.sent_at),new Date(req.body.sent_at)]);
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

	res.json({ message: 'Monitorings created!' });
});

router.route("/reports/:id")

	.get(function(req,res,next) {

		var sensor = parseInt(req.params.id);
		Monitoring.aggregate([[
			{ $match: { sensor_id: sensor } },
			{ $project:{ id: { date: { '$dateToString': { 'format': '%d-%m-%Y', 'date':'$date_create' } }, sensor_id: "$sensor_id" }, lectura: "$lectura" } },
			{ $group: { _id:'$id', 'avg_value':{$avg:'$lectura'}, 'min_value': { $min: '$lectura' }, 'max_value': { $max: '$lectura' } } },
			{ $sort: {'_id' : 1 } }
		]],
		function(err,monitoring)
		{
			res.json(monitoring);
		})
	});

module.exports=router;
