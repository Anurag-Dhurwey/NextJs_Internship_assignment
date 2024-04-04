import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
require("dotenv").config();

const app = express();
const server = createServer(app);

const io = new Server(server, { cors: { origin: "*" } });
const port = 3000;

app.use(cors({ origin: "*" }));


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


io.on("connection", async (socket) => {


  socket.on("disconnect", async () => {
    console.log("user disconnected");
  });
});

server.listen(port, () => {
  console.log("listening on :" + `${port}`);
});


module.exports = app;
