var http = require('http');
var url = require('url');
var mysql = require('mysql');
var fs = require('fs');
var childProcess = require('child_process');

// runScript function taken from answer on stack overflow
function runScript(scriptPath, args, callback) {

    // keep track of whether callback has been invoked to prevent multiple invocations
    var invoked = false;
    var process = childProcess.fork(scriptPath, args);

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });

}
//creates connection to database
var con = mysql.createConnection({
  host: "localhost",
  user: "mma",
  password: "password"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
 con.query("USE test_base", function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
  });
});
//begins the script that processes keyboard inputs
runScript('./scripts/improved_key_handler.js', [], function (err) {
		if (err) throw err;
});
//processes requests for the website and executes the appropriate script
http.createServer(function (req, res) {
   if(req.url == "/reset"){
	runScript('./scripts/reset.js', [], function (err) {
    		if (err) throw err;
    		console.log('finished running some-script.js');
	});
	return res.end();
   }else if(req.url == "/get_data"){
	con.query("SELECT * FROM bodies", function (err, result) {
		if (err) throw err;
		res.write(JSON.stringify(result));
		con.query("SELECT * FROM players", function (err, result) {
			if (err) throw err;
			res.write(JSON.stringify(result));
			con.query("SELECT * FROM dyson_sphere", function (err, result) {
				if (err) throw err;
				res.write(JSON.stringify(result));
				return res.end();
			});
		});
	});
   } else if(req.url.slice(req.url.length - 3) == ".js"){
	console.log(req.url);
	res.writeHead(200, {'Content-Type': 'text/html'});
	fs.readFile('./scripts' + req.url, function(err, data) {
		res.write(data);
		return res.end()
	});
   } else if(req.url.slice(req.url.length - 4) == ".png"){
	console.log(req.url);
	res.writeHead(200, {'Content-Type': 'image/png'});
	fs.readFile('./images' + req.url, function(err, data) {
		res.write(data);
		return res.end()
	});
   } else {
	console.log(req.url);
	res.writeHead(200, {'Content-Type': 'text/html'});
	fs.readFile('./index.html', function(err, data) {
		res.write(data);
		return res.end();
  	});
	}

}).listen(80);
