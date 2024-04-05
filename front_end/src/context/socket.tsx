"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import { io, Socket } from "socket.io-client";

export const SocketContext = createContext<{
  socket: Socket | null;
  rooms: string[];
  setRooms: React.Dispatch<React.SetStateAction<string[]>>;
  getUpdates(id: string): void;
  closeAllUpdates(): void;
  closeUpdate(id: string): void;
  emit: {
    comment_created: (comment: comment) => void;
    comment_removed: (cmt_id: string, post_id: string) => void;
    like: (post_id: string) => void;
    unLike: (post_id: string) => void;
  };
  on: {
    comment_created: (arg: (comment: comment) => void) => void;
    comment_removed: (arg: (cmt_id: string, post_id: string) => void) => void;
    like: (arg: (post_id: string) => void) => void;
    unLike: (arg: (post_id: string) => void) => void;
  };
  offListners: {
    comment_created: () => void;
    comment_removed: () => void;
    like: () => void;
    unLike: () => void;
}
} | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<string[]>([]);

  function getUpdates(id: string) {
    socket?.emit("get:updates", id);
    setRooms((pre) => [...pre, id]);
  }
  function closeAllUpdates() {
    socket?.emit("close:updates", rooms);
    setRooms([]);
  }
  function closeUpdate(id: string) {
    socket?.emit("close:updates", [id]);
    setRooms((pre) => pre.filter((i) => i != id));
  }

  const emit = {
    comment_created: function (comment: comment) {
      socket?.emit("created:comment", comment);
    },
    comment_removed: function (cmt_id: string, post_id: string) {
      socket?.emit("removed:comment", cmt_id, post_id);
    },
    like: function (post_id: string) {
      socket?.emit("increase:like", post_id);
    },
    unLike: function (post_id: string) {
      socket?.emit("decrease:like", post_id);
    },
  };

  const on = {
    comment_created: function (arg: (comment: comment) => void) {
      socket?.on("created:comment", arg);
    },
    comment_removed: function (arg: (cmt_id: string, post_id: string) => void) {
      socket?.on("removed:comment", arg);
    },
    like: function (arg: (post_id: string) => void) {
      socket?.on("increase:like", arg);
    },
    unLike: function (arg: (post_id: string) => void) {
      socket?.on("decrease:like", arg);
    },
  };
  const offListners = {
    comment_created: function () {
      socket?.off("created:comment");
    },
    comment_removed: function () {
      socket?.off("removed:comment");
    },
    like: function () {
      socket?.off("increase:like");
    },
    unLike: function () {
      socket?.off("decrease:like");
    },
  };

  useEffect(() => {
    const initSocket = async () => {
      const newSocket = io("http://localhost:3000"); // Replace with your server URL
      setSocket(newSocket);
      console.log("connected to socket");
    };
    initSocket();

    // Clean up socket connection on context unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        rooms,
        emit,
        on,
        setRooms,
        getUpdates,
        closeAllUpdates,
        closeUpdate,
        offListners
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};


export const useSocketContext=()=>{
  return useContext(SocketContext)
}


type comment = {
  _id:string
  postedBy: {
    name: string;
    email: string;
  };
  post: string;
  comment: string;
};
