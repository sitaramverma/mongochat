const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;


// connect

const mongoURI = 'mongodb://localhost:27017/mongochat'
mongo.connect(mongoURI, function(err,db){
    if(err){
        throw err;
    }
    console.log('Mongodb connected...');

    // connect to socket.io

    client.on('connection', function(socket){
        console.log('jhhhhh')
        let chat = db.collection('chats');
        // create function to send status
        sendStatus = function(s){
            socket.emit('status', s);
        }

        // get chat from mongodb collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            }
            // emit the result
            socket.emit('output', res);
        });

        // handle input events
        socket.io('input', function(data){
            let name = data.name;
            let message = data.message;
            if(name == '' || message == ''){
                // throw err
                sendStatus('Please enter name and message.')
            }else{
                // insert message
                chat.insert({name:name, message:message}, function(){
                    client.emit('output', [data]);
                    // send status object
                    sendStatus({
                        message:'Message sent',
                        clear:true
                    })
                });
            }
        });

        // handle clear
        socket.io('clear', function(data){
            chat.remove({}, function(){
                // emit cleared
                socket.emit('cleared');
            })
        });
    });
});