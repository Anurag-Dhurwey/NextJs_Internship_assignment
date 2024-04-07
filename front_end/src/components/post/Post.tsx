import React, { useContext, useEffect, useState } from "react";
import Media from "../media/Media";
import LikesButton from "../metadataOfMedia/miniComps/LikesButton";
import MobileViewMetaData from "../metadataOfMedia/MobileViewMetaData";
import DesktopMetaData from "../metadataOfMedia/DesktopMetaData";
import style from "./post.module.css";
import { media_Item } from "@/typeScript/basics";
import { SocketContext } from "@/context/socket";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import CommentIcon from "@mui/icons-material/Comment";
import DescriptionIcon from "@mui/icons-material/Description";
const Post = ({ item }: { item: media_Item }) => {
  const [cmtView, setCmtView] = useState(false);
  const [descView, setDescView] = useState(false);
  const { meadiaFiles, postedBy } = item;
  const socketContext = useContext(SocketContext);
  useEffect(() => {
    socketContext?.getUpdates(item._id);
  }, []);

  return (
    <div className={style.itemsOuterDiv}>
      <div className={style.itemsInnerDiv}>
        <Media meadiaFiles={meadiaFiles} />
        <Stack direction="row" spacing={1} className=" absolute top-0 right-0 ">
          <LikesButton meadia_item={item} />
          <IconButton
            className="min-[800px]:hidden"
            onClick={() => {
              setDescView(true);
            }}
            color="secondary"
            aria-label="Description"
          >
            <DescriptionIcon />
          </IconButton>
          <IconButton
            className="min-[800px]:hidden"
            onClick={() => {
              setCmtView(true);
            }}
            color="primary"
            aria-label="Comment"
          >
            <CommentIcon />
          </IconButton>
        </Stack>
        {(cmtView || descView) && (
          <MobileViewMetaData
            cmtView={cmtView}
            setCmtView={setCmtView}
            descView={descView}
            setDescView={setDescView}
            postedBy={postedBy}
            meadia_item={item}
          />
        )}
      </div>
      <DesktopMetaData meadia_item={item} user={postedBy.name || "Unknown"} />
    </div>
  );
};

export default Post;
