var player_number = "0";
var pressed = false
//function to handle key presses
function detect_keystrokes(ws){
	$(document).keyup( function(e) {
		pressed = false;
	});
	$(document).keydown( function(e) {
	e.preventDefault();
	//detects the key which was pressed and sends that info in a websockets message
	if(pressed == false){
	    if (e.keyCode == 37) {
	        messageBody = {"type": "movement", "player": player_number, "key": "left"}
		ws.send(JSON.stringify(messageBody));
	    }else if (e.keyCode == 38) {
	        messageBody = {"type": "movement", "player": player_number, "key": "up"}
		ws.send(JSON.stringify(messageBody));
	    }else if (e.keyCode == 39) {
	        messageBody = {"type": "movement", "player": player_number, "key": "right"}
		ws.send(JSON.stringify(messageBody));
	    }else if (e.keyCode == 40) {
	        messageBody = {"type": "movement", "player": player_number, "key": "down"}
		ws.send(JSON.stringify(messageBody));
	    }else if (e.keyCode == 68) {
	        messageBody = {"type": "purchase", "player": player_number, "key": "d"}
		ws.send(JSON.stringify(messageBody));
	    }else if (e.keyCode == 66) {
	        messageBody = {"type": "purchase", "player": player_number, "key": "b"}
		ws.send(JSON.stringify(messageBody));
	    }
	}; pressed = true;
	});
	ws.onmessage = (webSocketMessage) => {
	};
};


