const Client = require('../src/Client/MonsterCat');

var client = new Client({token: "TOKEN_HERE"});


client.on("CONNECTED", () => {
    console.log("Connected to monstercatfm!");
});

client.on("TRACK_UPDATE", (song) => {
    console.log(`Now playing: ${song.name} link: ${song.url}`);
});