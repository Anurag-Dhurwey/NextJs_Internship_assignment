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
  socket.on("get:updates", async (id?: string) => {
    if (!id) return;
    socket.join(`${id}`);
  });
  socket.on("close:updates", async (id?: string) => {
    if (!id) return;
    socket.leave(`${id}`);
  });

  socket.on("created:comment", async (comment?: comment) => {
    if (
      !comment ||
      !comment.comment ||
      !comment.post ||
      !comment.postedBy ||
      !comment.postedBy.email ||
      !comment.postedBy.name
    ) {
      return;
    }
    socket.to(comment.post).emit("created:comment", comment);
  });

  socket.on("removed:comment", async (cmt_id?: string,post_id?:string) => {
    if (
     !cmt_id||!post_id
    ) {
      return;
    }
    socket.to(post_id).emit("removed:comment", {cmt_id,post_id});
  });

  socket.on("increase:like", async (post_id?:string) => {
    if (
     !post_id
    ) {
      return;
    }
    socket.to(post_id).emit("increase:like", post_id);
  });

  socket.on("decrease:like", async (post_id?:string) => {
    if (
     !post_id
    ) {
      return;
    }
    socket.to(post_id).emit("decrease:like", post_id);
  });

  socket.on("disconnect", async () => {
    console.log("user disconnected");
  });
});

server.listen(port, () => {
  console.log("listening on :" + `${port}`);
});

module.exports = app;

type comment = {
  postedBy?: {
    name?: string;
    email?: string;
  };
  post?: string;
  comment?: string;
};
