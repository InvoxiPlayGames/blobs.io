class ffaSinglePlayerCreate {};
const Player = require("../structures/Player");

ffaSinglePlayerCreate.run = async (...args) => {
    const [blob, io, Base, data, sockets] = args;
    let socket = sockets.find(v => v.sessionid === blob);
    if (!socket) {
        let guestID = Math.floor((Math.random() * 999) + 1).toString();
        while(sockets.some(v => v.username === `Guest${guestID}`)) {
            guestID = Math.floor((Math.random() * 999) + 1).toString();
        }
        socket = {
            username: "Guest" + guestID,
            br: 0,
            role: -1,
            guest: true
        };
    } else socket.guest = false;


    const nblob = new Player();
    const room = Base.rooms[Base.rooms.findIndex(v => v.id === "ffa")];
    nblob.directionChangeCoordinates.x = Math.floor(Math.random() * 600);
    nblob.directionChangeCoordinates.y = Math.floor(Math.random() * 600);
    io.to(data.id).emit("ffaObjectsHeartbeat", room.map.map.objects);
    io.to(data.id).emit("ffaHeartbeat", {
        username: socket.username,
        br: socket.br,
        role: socket.role,
        x: nblob.directionChangeCoordinates.x,
        y: nblob.directionChangeCoordinates.y
    });
};

module.exports = ffaSinglePlayerCreate;
