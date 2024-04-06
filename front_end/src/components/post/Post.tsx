import React, { useContext, useEffect } from "react";
import Media from "../media/Media";
import LikesButton from "../metadataOfMedia/miniComps/LikesButton";
import MobileViewMetaData from "../metadataOfMedia/MobileViewMetaData";
import DesktopMetaData from "../metadataOfMedia/DesktopMetaData";
import style from "./post.module.css";
import { media_Item } from "@/typeScript/basics";
import { SocketContext } from "@/context/socket";
const Post = ({ item }: { item: media_Item }) => {
  const { meadiaFiles, postedBy } = item;
  const socketContext = useContext(SocketContext);
  useEffect(() => {
    socketContext?.getUpdates(item._id);
    
  }, []);

  return (
    <div className={style.itemsOuterDiv}>
      <div className={style.itemsInnerDiv}>
        <Media meadiaFiles={meadiaFiles} />
        <span className=" absolute top-0 right-0 flex justify-center items-start  rounded-xl pt-1 gap-x-[2px] min-[430px]:pr-1">
       
            <LikesButton meadia_item={item} />
          <MobileViewMetaData
            meadia_item={item}
            user={postedBy.name ? postedBy.name : "Unknown"}
          />
        </span>
      </div>
      <DesktopMetaData
        meadia_item={item}
        user={postedBy.name ? postedBy.name : "Unknown"}
      />
    </div>
  );
};

export default Post;
