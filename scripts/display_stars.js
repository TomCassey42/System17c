//initialize variables and import player ship images
var greenShip_image = new Image();
greenShip_image.src = "green.png";
var blueShip_image = new Image();
blueShip_image.src = "blue.png";
var redShip_image = new Image();
redShip_image.src = "red.png";
var game_data = {"bodies": 0, "players": 0, "dyson_sphere": 0};
var announced_winner = false;

//function to proccess incoming data from websockets
//updates player gui and game_data array accessed below using updated info 
function draw(i, ws) {
ws.onmessage = (webSocketMessage) => {
        response_text = webSocketMessage.data;
	game_data = {"bodies": JSON.parse(response_text)[0], "players":JSON.parse(response_text)[1], "dyson_sphere": JSON.parse(response_text)[2]};
	dyson_level = game_data["dyson_sphere"][0]["level"];
	dyson_cost = game_data["dyson_sphere"][0]["buy_price"];
	document.getElementById("dat_dyson").innerHTML = dyson_level;
	document.getElementById("dat_dcost").innerHTML = dyson_cost;
	if ((dyson_level == 3) && (announced_winner == false)){
		announced_winner = true;
		alert("Player "+game_data["dyson_sphere"][0]["controller"]+" Wins!");
	}
	if (player > 0){
		buy_price = game_data["bodies"][parseInt(game_data["players"][player-1]["current_body"])]["buy_price"];
		production_rate = game_data["bodies"][parseInt(game_data["players"][player-1]["current_body"])]["production_rate"];
		document.getElementById("dat_production").innerHTML = production_rate;
		document.getElementById("dat_cost").innerHTML = buy_price;
		if(JSON.parse(response_text)[3] !== undefined){
			document.getElementById("dat_money").innerHTML = JSON.stringify(JSON.parse(response_text)[3][player-1]);
		};
	};
};

//recursively call draw function
setTimeout(() => {draw(i + 1, ws); }, 10);
if (i%100 == 0){
const messageBody = {"type": "get_data"};
ws.send(JSON.stringify(messageBody));
}
//code to draw the bodies on the website using canvas
if (game_data["bodies"] != 0){
var canvas = document.getElementById('canvas');
canvas.width = screen.width*2;
canvas.height = screen.height*2;
  if (canvas.getContext) {
    var center = [Math.round(canvas.width/2), Math.round(canvas.height/2)];
    var spacing = Math.round(screen.width/10);
    var starsPerRing = [1,6,12,20,24,32];
    var ctx = canvas.getContext('2d');
    var body_number = 94;
    ctx.fillStyle = 'rgba(0,0,0,1)';
    var rect1 = new Path2D();
    var rect2 = new Path2D();
    var rect3 = new Path2D();
    //draws a circle for each body arranged in rings around the center star
    for (var radius = 0; radius <= 5; radius++) {
        for (var theta = 0; theta < starsPerRing[radius] ; theta++) {
            var circle = new Path2D();
            var dx = radius*spacing*Math.cos(Math.PI*2*(theta+1)/starsPerRing[radius]);
            var dy = radius*spacing*Math.sin(Math.PI*2*(theta+1)/starsPerRing[radius]);
            circle.arc(center[0] + dx, center[1] + dy, (1/(1+radius)**0.5)*spacing/5, 0, 2 * Math.PI);
            //determines the color of each body that is not the central star
	    if (body_number < 94){
		//retrieves the current planet owner from the database
            	color2 = game_data["bodies"][body_number]["controller"];
		//Sets the planet color to the color of its player owner
	    	if (color2 == 1) {ctx.fillStyle = 'rgba('+7+','+7+','+255+',1)';}
	    	else if (color2 == 2) {ctx.fillStyle = 'rgba('+7+','+255+','+28+',1)';}
	    	else if (color2 == 3) {ctx.fillStyle = 'rgba('+255+','+7+','+7+',1)';}
		//Colors the planet grey if it is unowned
		else {ctx.fillStyle = 'rgba('+192+','+192+','+192+',1)';}
	    }
	    //Sets the color of the central star and creates a pulsing animation
	    else {
            ctx.fillStyle = 'rgba('+(2*Math.abs((i%300)-150)).toString()+','+(1.20*Math.abs(((i+10)%300)-150)).toString()+','+ Math.abs((i%20)-10).toString() +',1)';
		ctx.lineWidth = 15;
		//Sets the outer ring color of the dyson sphere based on its current owner
		if (game_data["dyson_sphere"][0]["controller"] == 0) {ctx.strokeStyle = 'rgba('+255+','+255+','+255+',1)';}
		if (game_data["dyson_sphere"][0]["controller"] == 1) {ctx.strokeStyle = 'rgba('+7+','+7+','+255+',1)';}
		if (game_data["dyson_sphere"][0]["controller"] == 2) {ctx.strokeStyle = 'rgba('+7+','+255+','+28+',1)';}
		if (game_data["dyson_sphere"][0]["controller"] == 3) {ctx.strokeStyle = 'rgba('+255+','+7+','+7+',1)';}
		ctx.stroke(circle);
            }
            ctx.fill(circle);
	    //animates the ship rotating around the current body using the time interval i
	    //determines if the current body number has player 1 orbiting it
            if (body_number == game_data["players"][0]["current_body"]){
		//translates the canvas image to the center of the body and rotates it an angle according to a time interval i
                ctx.translate(center[0]+dx, center[1]+dy);
		ctx.rotate(i/20);
		//draws the ship
		ctx.drawImage(blueShip_image, -24-20, -16, 48, 32);
		//reverts the canvas back to its original position leaving the rotated ship
		ctx.rotate(-i/20);
		ctx.translate(-center[0]-dx, -center[1]-dy);
            }
	    //repeats method used for player 1
            if (body_number == game_data["players"][1]["current_body"]){
		ctx.translate(center[0]+dx, center[1]+dy);
		ctx.rotate(i/20 + 2*Math.PI/3);
		ctx.drawImage(greenShip_image, -24-20, -16, 48, 32);
		ctx.rotate(-i/20 - 2*Math.PI/3);
		ctx.translate(-center[0]-dx, -center[1]-dy);
            }
            if ((body_number)  == game_data["players"][2]["current_body"]){
                ctx.translate(center[0]+dx, center[1]+dy);
		ctx.rotate(i/20 + 4*Math.PI/3);
		ctx.drawImage(redShip_image, -24-20, -16, 48, 32);
		ctx.rotate(-i/20 - 4*Math.PI/3);
		ctx.translate(-center[0]-dx, -center[1]-dy);
            }
            body_number = body_number - 1;
        }
    }

  }
  }
}
