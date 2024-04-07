"use client";
import React, { useState } from "react";
import TitleDesc from "./miniComps/TitleDesc";
import CommentBox from "./miniComps/CommentBox";
import { media_Item } from "@/typeScript/basics";
interface Iprops{
  meadia_item:media_Item,user:string
}
const DesktopMetaData = ({ meadia_item, user }:Iprops) => {
  const { caption, desc, _id } = meadia_item;
  const [cmtView, setCmtView] = useState(false);
  const [descView, setDescView] = useState(false);

  return (
    <div className={` w-[30%] h-[395px] overflow-hidden max-[825px]:w-[38%] max-[800px]:hidden`}>
      <TitleDesc
        useStates={{ cmtView, descView, setCmtView, setDescView }}
        user={user}
        caption={caption}
        desc={desc}
      />
      <CommentBox
        useStates={{ cmtView, descView, setCmtView, setDescView }}
        meadia_item={meadia_item}
      />
    </div>
  );
};

export default DesktopMetaData;
