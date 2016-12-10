var mongoose = require("mongoose");
var Schema = mongoose.Schema;

mongoose.connect("mongodb://localhost/agroeffect");

var monitoring_schema = new Schema({
	sensor_id:Number,
	lectura:Number,
	tipo:String,
	date_create:Date
});

var Monitoring = mongoose.model("Monitoring",monitoring_schema);

module.exports.Monitoring = Monitoring;