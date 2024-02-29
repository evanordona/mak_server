const express = require('express')
const app = express()
const http = require('http')
const cors = require('cors')
const server = http.createServer(app)
const bodyParser = require('body-parser')
const port = process.env.PORT || 5000;

const { Server } = require('socket.io')

app.use(cors())

const io = new Server(server, {
    cors: {
        origin: 'https://mak-game.onrender.com',
        methods: ['GET', 'POST'],
    }
})

// Parses the text as url encoded data
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send("hello world!");
})

const rooms = {}

io.on('connection', (socket) => {
    
    // Hosting and joining room
    socket.on('joinRoom', (code) => {
        console.log(code);

        //join the room
        socket.join(code)

        if (!rooms[code]) {
            rooms[code] = 1
        } else if (rooms[code] < 2) {
            // if 2 players in room
            rooms[code] += 1
            if (rooms[code] == 2) {
                io.to(code).emit('startGame')
            } 
        }
        console.log(rooms[code])
    })

    socket.on('send-card', (card, code) => {
        console.log(card);
        socket.to(code).emit("receive-card", card)
    })

   
    

    socket.on('disconnect', () => {
        rooms[Object.keys(socket.rooms).filter(item => item!=socket.id)[0]] -= 1 

        if (rooms[Object.keys(socket.rooms).filter(item => item!=socket.id)[0]] == 0) {
            delete rooms[Object.keys(socket.rooms).filter(item => item!=socket.id)[0]]
        }
        console.log('user disconnected');
    });

    
})

server.listen(port, () => {
    console.log(`app listening on port ${port}`)
})