//creates web socket connection
async function begin(){
	websocket_connection = await connectToServer();
	draw(0, websocket_connection);
	detect_keystrokes(websocket_connection);
}

async function connectToServer() {
        const ws = new WebSocket('ws://3.82.165.49:7071/ws');
        return new Promise((resolve, reject) => {
            const timer = setInterval(() => {
                if(ws.readyState === 1) {
                    clearInterval(timer)
                    resolve(ws);
                }
            }, 10);
      });
 }
