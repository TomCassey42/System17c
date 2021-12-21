
var fsExtra = require('fs-extra');
var chokidar = require('chokidar');
var fs = require('fs');
var mysql = require('mysql');
var con = mysql.createConnection({
host: "localhost",
user: "mma",
password: "password"
});
//establish connection to database
con.query("USE test_base", function (err, result){
	if (err) throw err;
	//set up websocket
	const WebSocket = require('ws');
	const wss = new WebSocket.Server({ port: 7071 });
	const clients = new Map();
	wss.on('connection', (ws) => {
		const metadata = {"catch-phrase":"bunch a' ham"};
    		clients.set(ws, metadata);
		ws.on('message', (messageAsString) => {
			const message = JSON.parse(messageAsString);
			var type = message["type"];
			var player = message["player"];
			var key = message["key"];
			var outbound = "";
			//process incoming message and write outbound message
			if ((type == "movement") && (player > 0)){
      				next_body = move(player, key);
				dataget(function(result){
				database = result;
				outbound = JSON.stringify(database);
	      			[...clients.keys()].forEach((client) => {
        				client.send(outbound);
      				});
				});
			}
			else if (type == "get_data"){
				dataget(function(result){
				database = result;
				balance(function(result){
					database[3] = result;
					outbound = JSON.stringify(database);
					ws.send(outbound);
				});
				});
			}
			else if ((type == "purchase") && (player > 0)){
      				if (key == 'b'){
					body = buy(player);
				}
				else if (key == 'd'){
					body = dyson(player);
				}
				outbound = JSON.stringify(message);
			}
    		});
		ws.on("close", () => {
		      clients.delete(ws);
    		});
	});
});

//function to move player
function move(player, key){
	next_body = 0;
	//requests current player position from database
	con.query("SELECT current_body FROM players WHERE player_number="+player, function (err, result) {
			if (err) throw err;
			current_body = JSON.stringify(result[0]["current_body"]);
			next_body = target_body(parseInt(current_body), key);
			//updates databse with new player position
			con.query("UPDATE players SET current_body="+next_body.toString()+"  WHERE player_number="+player,
						function(err, result){
							if (err){
								throw err;
								console.log(err);
							}

			});
	});
	return next_body;
}

//function to buy planets
function buy(player){
	current_body = 0;
	//requests all relavent infomation from the database
	con.query("SELECT current_body, secured_value FROM players WHERE player_number="+player, function (err, result) {
		if (err) throw err;
		current_body = JSON.stringify(result[0]["current_body"]);
		player_secured_value = parseInt(JSON.stringify(result[0]["secured_value"]));
		con.query("SELECT buy_price, controller, control_time, production_rate FROM bodies WHERE body_number="+current_body, function (err, result) {
				if (err) throw err;
				price = parseInt(JSON.stringify(result[0]["buy_price"]));
				owner = JSON.stringify(result[0]["controller"]);
				control_time = JSON.stringify(result[0]["control_time"]);
				production_rate = JSON.stringify(result[0]["production_rate"]);
				balance(function(result){
				player_balance = result[player-1];
				//checks if player has enough currency, if so, update the owner, player balance, previous owner balance and purchase time
				if ((player_balance >= price) && (player != owner)){
					con.query("UPDATE bodies SET controller="+player+"  WHERE body_number="+current_body,function(err, result){
						if (err) throw err;
						con.query("UPDATE players SET secured_value="+(player_secured_value - price).toString()+" WHERE player_number="+player, function(err, result){
							if (err) throw err;
							const d = new Date();
							let time = parseInt(d.getTime()/1000);
							con.query("UPDATE bodies SET control_time="+(time).toString()+" WHERE body_number="+current_body, function(err, result){
								if (err) throw err;
								if (owner > 0){
									con.query("SELECT secured_value FROM players WHERE player_number="+owner, function (err, result){
									owner_secured_value = parseInt(JSON.stringify(result[0]["secured_value"]));
										con.query("UPDATE players SET secured_value="+(production_rate*(time-control_time)+owner_secured_value).toString()+" WHERE player_number="+owner, function(err, result){
											if (err) throw err;
										});
									});
								}
							});
						});
					});
				}
				});
		});
	});
	return current_body;
}
//function to upgrade the dyson sphere
function dyson(player){
	current_body = 0;
	//requests all relavant information for the database
	con.query("SELECT current_body, secured_value FROM players WHERE player_number="+player, function (err, result) {
		if (err) throw err;
		current_body = JSON.stringify(result[0]["current_body"]);
		player_secured_value = parseInt(JSON.stringify(result[0]["secured_value"]));
		if (current_body > 87){
		con.query("SELECT controller FROM bodies WHERE body_number in(93,92,91,90,89,88)", function (err, result) {
				if (err) throw err;
				owners = result;
				var controlled_bodies_in_center = 0;
				for (let i = 0; i < 6; i++){
					if (player == result[i]["controller"]){
						controlled_bodies_in_center++;
					};
				};
				balance(function(result){
				player_balance = result[player-1];
				con.query("SELECT controller, level, buy_price FROM dyson_sphere",function(err, result){
					if (err) throw err;
					dyson_owner = JSON.stringify(result[0]["controller"]);
					upgrade_level = parseInt(JSON.stringify(result[0]["level"]));
					price = parseInt(JSON.stringify(result[0]["buy_price"]));
					// checks if player controls 3 bodies in the center and has enough currency, if so update dyson sphere control level, controller, and player balance
					if ((player_balance >= price) && (controlled_bodies_in_center >= 3) && (upgrade_level < 3)){
						new_price = price*1.5;
						if (player == dyson_owner){
							con.query("UPDATE dyson_sphere SET level="+(upgrade_level + 1).toString()+", buy_price="+(new_price).toString(), function(err, result){
							if (err) throw err;
								con.query("UPDATE players SET secured_value="+(player_secured_value - price).toString()+" WHERE player_number="+player, function(err, result){
								if (err) throw err;
								});
							});
						}
						else if (0 == upgrade_level){
							con.query("UPDATE dyson_sphere SET controller="+player+",level= 1, buy_price="+(new_price).toString(), function(err, result){
							if (err) throw err;
								con.query("UPDATE players SET secured_value="+(player_secured_value - price).toString()+" WHERE player_number="+player, function(err, result){
								if (err) throw err;
								});
							});
						}
						else if (player != dyson_owner){
							con.query("UPDATE dyson_sphere SET level="+(upgrade_level - 1).toString()+", buy_price="+(new_price).toString(), function(err, result){
							if (err) throw err;
								con.query("UPDATE players SET secured_value="+(player_secured_value - price).toString()+" WHERE player_number="+player, function(err, result){
								if (err) throw err;
								});
							});
						};
					};
				});
				});
		});
		}
	});
	return current_body;
};

//function to calculate player balance
function balance(callback){
	var balances = [];
	// requests all relavant info from the database
	con.query("SELECT secured_value FROM players", function (err, result) {
		if (err) throw err;
		balances[0] = parseInt(JSON.stringify(result[0]["secured_value"]));
		balances[1] = parseInt(JSON.stringify(result[1]["secured_value"]));
		balances[2] = parseInt(JSON.stringify(result[2]["secured_value"]));
		con.query("SELECT controller, control_time, production_rate FROM bodies", function (err, result) {
				if (err) throw err;
				owners = result;
				const d = new Date();
				let time = d.getTime()/1000;
				//calculates player total balance from secured balance, time of ownership, and production rate for each body
				for (let i = 0; i < 94; i++){
					player_num = parseInt(result[i]["controller"]);
					if (player_num > 0){
						balances[player_num-1] = balances[player_num-1] + Math.round((time-parseInt(owners[i]["control_time"]))*parseInt(owners[i]["production_rate"]));
					}
				}
				return callback(balances);
		});
	});
}
//function to request all data from the database
function dataget(callback){
	var database=[];
	var sql = "SELECT * FROM bodies";
	con.query(sql, function(err, result){
		if (err) throw err;
		database[0] = result;
		con.query("SELECT * FROM players", function (err, result) {
			if (err) throw err;
			database[1] = result;
			con.query("SELECT * FROM dyson_sphere", function (err, result) {
				if (err) throw err;
				database[2] = result;
				return callback(database);
			});
		});
	});
}
//funtion to calculate the body to move to according to the input key
function target_body(current_body, key){
	next_body = 0;
	ring_indices = [0,32,56,76,88,94];
	current_ring = 0;
	for (let i = 1; i < ring_indices.length; i++){
		if ((current_body >= ring_indices[i-1]) && (current_body < ring_indices[i])){
			current_ring = i;
		}
	}
	stars_in_current_ring = ring_indices[current_ring] - ring_indices[current_ring-1];
	if(key == "left"){
		next_body = ((current_body + 1 - ring_indices[current_ring-1] + stars_in_current_ring) % stars_in_current_ring) + ring_indices[current_ring-1];
	}else if(key == "right"){
		next_body = ((current_body - 1 - ring_indices[current_ring-1] + stars_in_current_ring) % stars_in_current_ring) + ring_indices[current_ring-1];
	}else if(key == "up"){
		if (current_ring > 1){
			stars_in_outer_ring = ring_indices[current_ring-1] - ring_indices[current_ring-2];
			next_body = Math.round((current_body - ring_indices[current_ring-1]) * (stars_in_outer_ring / stars_in_current_ring)) % stars_in_outer_ring + ring_indices[current_ring-2];
		}else{
			next_body = current_body;
		}
	}else if(key == "down"){
		if (current_ring < 5){
			stars_in_inner_ring = ring_indices[current_ring+1] - ring_indices[current_ring];
			next_body = Math.round((current_body - ring_indices[current_ring-1]) * (stars_in_inner_ring / stars_in_current_ring)) % stars_in_inner_ring + ring_indices[current_ring];
		}else{
			next_body = current_body;
		}
	}
	return next_body;
}
