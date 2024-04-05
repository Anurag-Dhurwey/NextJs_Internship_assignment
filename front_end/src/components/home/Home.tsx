"use client";
import React, {  useEffect } from "react";
import style from "./home.module.css";
import { useAppDispatch, useAppSelector } from "../../redux_toolkit/hooks";
import { RootState } from "@/redux_toolkit/store";
// import {
//   toggle_dark_mode,
//   set_media_items,
//   set_Admin,
// } from "../../redux_toolkit/features/indexSlice";
// import DesktopMetaData from "../metadataOfMedia/DesktopMetaData";
import { useSession } from "next-auth/react";
// import Media from "../media/Media";
// import LikesButton from "../metadataOfMedia/miniComps/LikesButton";
// import MobileViewMetaData from "../metadataOfMedia/MobileViewMetaData";
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
            // <div key={i} className={style.itemsOuterDiv}>
            //   <div className={style.itemsInnerDiv}>
            //     <Media meadiaFile={meadiaFile} />
            //     <span className=" absolute top-0 right-0 flex justify-center items-start gap-x-4 rounded-xl">
            //       <span className="flex items-center pt-1 gap-x-[2px] min-[430px]:pr-1">
            //         <LikesButton meadia_item={item} />
            //       </span>
            //       <MobileViewMetaData
            //         meadia_item={item}
            //         user={postedBy.name ? postedBy.name : "Unknown"}
            //       />
            //     </span>
            //   </div>
            //   <DesktopMetaData
            //     meadia_item={item}
            //     user={postedBy.name ? postedBy.name : "Unknown"}
            //   />
            // </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
