var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//mongoose.connect("mongodb://jconchah9:Jnka0911@ds159767.mlab.com:59767/agroeffect");
mongoose.connect('mongodb://agroeffect.cl/agroeffect');

var monitoring_schema = new Schema({
	sensor_id: Number,
	lectura: Number,
	tipo: String,
	date_create: Date
});

var Monitoring = mongoose.model("Monitoringsensor", monitoring_schema);

module.exports.Monitoring = Monitoring;
