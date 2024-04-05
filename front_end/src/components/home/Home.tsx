"use client";
import React, {  useEffect } from "react";
import style from "./home.module.css";
import { useAppDispatch, useAppSelector } from "../../redux_toolkit/hooks";
import { RootState } from "@/redux_toolkit/store";
import { useSession } from "next-auth/react";
import { getMediaItems } from "@/utilities/functions/getMediaItems";
import { message } from "antd";
import Post from "../post/Post";
import { useSocketContext } from "@/context/socket";

const Home = () => {
  const socketContext=useSocketContext()
  const scrrenMode = useAppSelector((state: RootState) => state.hooks.darkmode);
  const { data: session } = useSession();
  const admin = useAppSelector((state) => state.hooks.admin);
  const media_Items = useAppSelector(
    (state: RootState) => state.hooks.media_Items
  );
  const dispatch = useAppDispatch();
  const [messageApi, contextHolder]=message.useMessage()

  function withUseEffect() {
    if (!media_Items?.length) {
      getMediaItems({dispatch,messageApi});
    }
  }

  useEffect(() => {
   withUseEffect()
  }, [session]);
  return (
    <div className={style.main}>
      {contextHolder}
      <div className={style.secondDiv}>
        {media_Items.map((item, i) => {
          return (
            <Post item={item} key={i}/>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
