var BaseController = require("./base"),
	fs = require("fs");

module.exports = BaseController.extend ({
    run : function(req,res,next) {
        res.render('draw');
    }
});
