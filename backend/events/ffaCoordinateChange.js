class ffaCoordinateChangeEvent {}

ffaCoordinateChangeEvent.run = async (...args) => {
    const [eventd, data, io, Base, sqlite] = args;
    try {
		const room = Base.rooms[Base.rooms.findIndex(v => v.id === "ffa")];
		if (!room) return;
        let prev = room.players[room.players.findIndex(v => v.id === data.id)];
        if (!prev) return;
        if((Math.abs(eventd.x - prev.x) > 50 || Math.abs(eventd.y - prev.y) > 50)) {
            io.to(data.id).emit("ffaKick", "Suspicious coordinate change.");
            data.disconnect();
        } 
        eventd.lastnom = prev.lastnom;
        eventd._directionChange = prev._directionChange;
        eventd.role = prev.role;
        if (eventd.x < 0 || isNaN(eventd.x)) eventd.x = 0;
        if (eventd.y < 0 || isNaN(eventd.y)) eventd.y = 0;
        if (eventd.x > 2000) eventd.x = 2000;
        if (eventd.y > 2000) eventd.y = 2000;
        prev.x = eventd.x;
        prev.y = eventd.y;
	} catch (e) {}
};

module.exports = ffaCoordinateChangeEvent;
