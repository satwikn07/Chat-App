const webSocket = require('ws'); // imported the webScoket library
const webSocketServer = new webSocket.Server({ port: 8080 }); // create a webSocket server on port 8080

const Redis = require('redis');
// const {Kafka} = require('kafkajs');

const redisClient = Redis.createClient(); // create redis client
redisClient.connect(); // returns a promise

const clients = new Map(); // store connected clients

webSocketServer.on('connection', (ws) => { // handle new connections
    let userId = null; // initialize userId to null

    ws.on('message', async(message) => { // handle incoming messages)    
        try {
            const data = JSON.parse(message); // JSON into object

            if(data.type === 'register') { // if message type is register
                userId = data.userId; // set userId from data
                clients.set(userId, ws); // store the client in the map
                console.log(`User ${userId} registered`);


                //check redis for any queued messages for this user
                const queuedMessages = await redisClient.lRange(`offline:${userId}`, 0, -1);
                if (queuedMessages.length > 0){
                    queuedMessages.forEach((msg) => {
                        ws.send(msg); // send each queued message to the user
                    });
                    await redisClient.del(`offline:${userId}`); // clear the queue after sending
                    console.log(`Sent ${queuedMessages.length} queued messages to user ${userId}`);
                }
            }
            else if(data.type === 'message'){
                const{to, message: msgText} = data; // destructure to and message from data

                const outgoingMessage = JSON.stringify({
                    from: userId,
                    message: msgText
                })

                const receiverWebSocket = clients.get(to); // get the receiver's WebSocket connection
                if (receiverWebSocket) {
                    receiverWebSocket.send(outgoingMessage); // send the message to the receiver
                    console.log(`Message from ${userId} to ${to}: ${msgText}`);
                } else {
                    // If the receiver is not connected, store the message in Redis
                    await redisClient.rPush(`offline:${to}`, outgoingMessage);
                    console.log(`User ${to} is offline. Message queued.`);
                }
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    })
    ws.on('close',()=>{
        if (userId) {
            clients.delete(userId); // remove the client from the map on disconnect
            console.log(`User ${userId} disconnected`);
        }
    }) // handle connection close
});

console.log('WebSocket server is running on ws://localhost:8080'); // log server start