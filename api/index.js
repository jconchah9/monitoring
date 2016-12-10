var express = require("express");
var router = express.Router();
var Monitoring = require('../models/monitoring').Monitoring;
var cors = require('cors');

/* REST */
router.use(cors());
router.route("/monitorings/:sensor_id")
.get(function(req,res,next) {
	
	var sensor = req.params.sensor_id;
	Monitoring.find({sensor_id:sensor},function(err,monitoring) {
		res.json(monitoring);
		console.log(err);

	})
	

});

router.route("/reports/")
.get(function(req,res,next) {
	
	
	Monitoring.aggregate([[
        {$project:{
        id: { 
            date: {'$dateToString':{'format': '%d-%m-%Y', 'date':'$date_create'} },
            sensor_id:"$sensor_id"
            },    
        lectura:"$lectura"       
            }
    },
    {$group:{
            _id:'$id',            
            'avg_lectura':{$avg:'$lectura'}
            }
    },
        
    {$sort:{'_id' : -1}}
    ]],function(err,monitoring) 
	{
		res.json(monitoring);
		console.log(monitoring['sensor']);
		console.log(err);

	})
	

});

module.exports=router;



