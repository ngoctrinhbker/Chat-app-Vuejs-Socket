let app = require("express")();
let http = require("http").Server(app);
let io = require("socket.io")(http);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

http.listen(4000, () => {
  console.log("Listening on port *: 4000");
});

io.on("connection", socket => {
  socket.on("error", er => console.log("error: ", er));

  socket.emit("connections", Object.keys(io.sockets.connected).length);

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("chat-message", data => {
    socket.broadcast.emit("chat-message", data);
  });

  socket.on("typing", data => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("stopTyping", data => {
    socket.broadcast.emit("stopTyping", data);
  });

  socket.on("joined", data => {
    socket.broadcast.emit("joined", data);
  });

  socket.on("leave", data => {
    socket.broadcast.emit("leave", data);
  });
});
