var BaseController = require("./base"),
	fs = require("fs");
	model = new (require("../models/ContentModel")),

module.exports = BaseController.extend ({
    run : function(req,res,next) {
		//model.setDB(req.db);
		//model.insert({"name":"swapi"},function(){console.log("Inserted");});
        res.render('draw');
    }
});
