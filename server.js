var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');

app.listen(3000);									  

function handler(req,res){
	// __dirname
	// is a node variable that has the curr path
	//
	fs.readFile(__dirname+'/index.html', function(err, data){
		if (err){
			res.writeHead(500);
			return res.end('Error loading index.html');
		}else{
			res.writeHead(200);
			res.end(data);
		}
	});
}

io.sockets.on('connection', function (socket) {
	// show all clients connected 
	var clients = io.sockets.clients();
	console.log('-- all clients connected: '+clients.length);
	
	// sending welcome msg
	socket.emit('news', {greet:'welcome to chatroom! Mr.'+socket.id, id:socket.id});

	// logging ack
	socket.on('ack', function (data) {
		console.log(data);
	});

	// chat
	socket.on('chat', function (data) {
		console.log('incomeing chat -------');
		console.log('User: '+socket.id);
		console.log('Says: '+data);
		io.sockets.emit('chat_rcv', {id:socket.id, msg:data});
	});

	// handling join room event
	socket.on('subscribe', function(data){
		socket.join(data['room']);
		// tell everyone in this room your joined
		io.sockets.emit('clientJoined', {room:data['room'],id:socket.id});
	});

	// talk
	socket.on('talk',function(data){
		// emit to everyone in the room
		io.sockets.in(data['room']).emit('printMsg', {msg:data['msg'], room:data['room'],id:socket.id});
	});	
});
