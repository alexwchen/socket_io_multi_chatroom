## Multiroom Chatroom using only Socket.io and Nodejs
I hacked together this little example to understand socket.io and various features. I looked at these sourced when I was studying this topic. Warning! this is not perfect code. It is very quick hack.

http://socket.io/

Building a Sails Application: Ep18 - Understanding Web Sockets and Socket IO
https://www.youtube.com/watch?v=dkf3XKrsqAM

#### Source Link
https://github.com/alexwchen/socket_io_multi_chatroom

#### How to use?
```
npm install socket.io
node server.js
```

### Documentation

###### Read Static File (index.html) with Nodejs
```javascript
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
```

###### Server.js
```javascript
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
```

Interesting stuff used:
* socket.emit

```javascript
// send out events, to the client, one client
// send an obj
io.sockets.emit('chat_rcv', {id:socket.id, msg:data});
// just send over text
io.sockets.emit('chat_rcv', 'hello');
```

* sockets.emit (notice the extra s in the end of sockets)

```javascript
// send out events to every client connected
io.sockets.emit('clientJoined', {room:data['room'],id:socket.id});
```
* socket.join('room') and socket.in

```javascript

// room is just any random text, a room is just a collective list of socket.id
// so we can emit to a selected group of socket.id
socket.join(data['room']);

// "in" is when you want to send message in a particular room, here is the example
io.sockets.in(data['room']).emit('printMsg', {msg:data['msg'], room:data['room'],id:socket.id});
```

* socket vs io.sockets

```javascript
io.sockets.on('connection', function (socket) {
	// socket is in the connection block scope, it is the connected client's socket.
	// eg. socket.id

	// io.sockets pretty much just contain all the socket.id connected to the server
});
```




Index.html
```javascript
<!DOCTYPE html>
<html>
  <head>
    <title></title>
  </head>
  <body>
    Chat Room 1
    <div id='chatroom1' class='chatroom'>
      <div class='chatspace' style='border:1px solid black;height:100px;'></div>

      <input style='display:none' class='chatmsg' type='text'></input>
      <input style='display:none' class='chatsubmit' type='submit'></input>
      <button>join</button>
    </div>


    Chat Room 2
    <div id='chatroom2' class='chatroom'>
      <div class='chatspace' style='border:1px solid black;height:100px;'></div>

      <input style='display:none' class='chatmsg' type='text'></input>
      <input style='display:none' class='chatsubmit' type='submit'></input>
      <button>join</button>
    </div>

  </body>
  <script src='/socket.io/socket.io.js'></script>
  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
  <script>
    var username = '';
    var socket = io.connect('http://localhost');

    // welcoming news
    socket.on('news', function (data) {
      console.log('-- news: '+data['greet']);
      username = data['id'];
      socket.emit('ack', '-- ack: news');
    });


    // trigger join room event
    $('button').on('click',function(){
      var room = $(this).parent().attr('id');
      socket.emit('subscribe', {room:room});
      // show chat function
      $(this).parent().find('.chatmsg').show();
      $(this).parent().find('.chatsubmit').show();
    });

    // join room ack
    socket.on('clientJoined', function(data){
      $('#'+data['room']).find('.chatspace').append(data['id']+ ' Just Join the Room! </br>');
    });

    // talk in room
    $('.chatsubmit').on('click',function(){
      // get msg
      var msg = $(this).parent().find('.chatmsg').val();
      var room = $(this).parent().attr('id');
      socket.emit('talk',{msg:msg, room:room});
    });

    socket.on('printMsg',function(data){
      $('#'+data['room']).find('.chatspace').append(data['id']+ ': '+data['msg']+'</br>');
    });
  </script>
</html>
```

Interesting stuff used:
* socket.io.js file

```html
<!-- you won't find this file anywhere, it is somehow generated by socket.io. So just include it and don't worry about where it is.-->
<script src='/socket.io/socket.io.js'></script>
```

* To use socket.io on client side

```javascript
// STEP 1
// declare our socket so we can use it
var socket = io.connect('http://localhost');

// STEP2
// you are done, you can use it now
socket.on('news', function (data) {
	username = data['id'];
	socket.emit('ack', '-- ack: news');
});
```
