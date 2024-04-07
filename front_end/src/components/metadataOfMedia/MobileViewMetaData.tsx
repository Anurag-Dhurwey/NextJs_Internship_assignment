import React from "react";
import { MdOutlineClose } from "react-icons/md";
import TitleDesc from "./miniComps/TitleDesc";
import CommentBox from "./miniComps/CommentBox";
import { media_Item, min_id_of_usr } from "@/typeScript/basics";
interface Iprops {
  meadia_item: media_Item;
  postedBy: min_id_of_usr;
  cmtView:boolean
  setCmtView: React.Dispatch<React.SetStateAction<boolean>>
  descView:boolean
  setDescView: React.Dispatch<React.SetStateAction<boolean>>
}
const MobileViewMetaData = ({ meadia_item, postedBy,cmtView,setCmtView,descView,setDescView }: Iprops) => {


  return (
    <>
      <div className="w-full h-full overflow-hidden absolute top-0 right-0">
            <span className=" absolute top-0 right-0 p-1">
              <button
                onClick={() => {
                  setDescView(false), setCmtView(false);
                }}
              >
                <MdOutlineClose
                  style={{
                    fontSize: "large",
                    fontWeight: "600",
                    color: "black",
                  }}
                />
              </button>
            </span>
            {descView && (
              <TitleDesc
                useStates={{ cmtView, descView, setCmtView, setDescView }}
                user={postedBy.name || "Unknown"}
                caption={meadia_item.caption}
                desc={meadia_item.desc}
              />
            )}
            {cmtView && (
              <CommentBox
                useStates={{ cmtView, descView, setCmtView, setDescView }}
                meadia_item={meadia_item}
              />
            )}
          </div>
    </>
  );
};

export default MobileViewMetaData;
