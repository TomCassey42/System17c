var mysql = require('mysql');
//creates connection to the database
var con = mysql.createConnection({
host: "localhost",
user: "mma",
password: "password"
});

con.query("USE test_base", function (err, result){
	if (err) throw err;
});
//removes tables in they exist
con.query("DROP TABLE IF EXISTS bodies", function(err, result){ if (err) throw err;});
con.query("DROP TABLE IF EXISTS players", function(err, result){ if (err) throw err; });
con.query("DROP TABLE IF EXISTS dyson_sphere", function(err, result){ if (err) throw err; });
//creates bodies table
con.query("CREATE TABLE bodies(body_number INT, buy_price INT, fortification_level INT, production_rate INT, production_level INT, controller INT, control_time INT)",
	function(err, result){
		if (err) throw err;
		console.log(err);
		initialize_body_values();
});

//creates players table
con.query("CREATE TABLE players(player_number INT, current_body INT, secured_value INT)",
	function(err, result){
		if (err) throw err;
		console.log(err)
		initialize_player_values();
});


//creates dyson sphere table
con.query("CREATE TABLE dyson_sphere(controller INT, level INT, buy_price INT)",
	function(err, result){
		if (err) throw err;
		console.log(err)
		initialize_dyson_sphere();
});

//adds in initial values for bodies table
function initialize_body_values(){
for (let i = 0; i < 94; i++) {
	ring_number = 0;
	if (i < 32){
		ring_number = 1;
	}else if (i < 56){
		ring_number = 2;
	}else if (i < 76){
		ring_number = 3;
	}else if (i < 88){
		ring_number = 4;
	}else if (i < 94){
		ring_number = 5;
	}
	con.query("INSERT INTO bodies VALUES (" + i.toString() + ", " + Math.ceil((1/10 + Math.random())*(3.5**ring_number)).toString() + ", 0, "
						 + Math.ceil((1/10 + Math.random())*(ring_number**2)).toString() + ", 0, 0, 0)",
		function(err, result){
			if (err) throw err;
	});
}
}
//adds in initial values for players table
function initialize_player_values(){
for (let i = 1; i <= 3; i++) {
	con.query("INSERT INTO players VALUES (" + i.toString() + ", " + (Math.round(Math.random()*32)).toString() + ", 15)",
		function(err, result){
			if (err) throw err;
	});
}
}
//addeds in initial values for dyson sphere table
function initialize_dyson_sphere(){
con.query("INSERT INTO dyson_sphere VALUES (0, 0, 500)",
		function(err, result){
			if (err) throw err;
});
}
