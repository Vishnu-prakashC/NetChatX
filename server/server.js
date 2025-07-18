const express=require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST']
    }
});
app.use(cors());
app.use(express.json());

const PORT=5000;
//const PORT = 5000;

//ithu socket io connection

io.on('connection', (socket) => {
    console.log('A user connected:' + socket.id);

    socket.on('send_message', (data) => {
        io.emit('receive_message', data);
    });
    socket.on('disconnect', () => {
        console.log('A user disconnected' + socket.id);
    });
});

app.get('/', (req, res) => {
    res.send('backend successfully running......');
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});