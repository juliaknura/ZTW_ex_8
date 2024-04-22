const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => console.log(`server on port ${PORT}`))
const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname, 'public')))

let socketsConected = {}

let currentUsers = 0

io.on('connection', onConnected)

function onConnected(socket) {
    console.log('Socket connected: ' + socket.id)
    socketsConected[socket.id] = null

    socket.on('new-user', (data) => {
        console.log("New user: " + data)

        currentUsers = currentUsers + 1
        socketsConected[socket.id] = data

        io.emit('clients-total', currentUsers)
        io.emit('user-list', [...nickList()])
        io.emit('user-joined', data)
    })

    socket.on('disconnect', () => {
        console.log('Socket disconnected: ' + socket.id)
        console.log("User left: " + socketsConected[socket.id])

        if(socketsConected[socket.id] != null)
        {
            io.emit('user-left', socketsConected[socket.id])
        }

        delete socketsConected[socket.id]
        currentUsers = currentUsers - 1

        io.emit('clients-total', currentUsers)
        io.emit('user-list', [...nickList()])
    })

    socket.on('message', (data) => {
        socket.broadcast.emit('chat-message', data)
    })

    socket.on('feedback', (data) => {
        socket.broadcast.emit('feedback', data)
    })
}

function nickList()
{
    let nicklist = new Set()
    for(let id in socketsConected)
    {
        nicklist.add(socketsConected[id])
    }
    return nicklist
}


