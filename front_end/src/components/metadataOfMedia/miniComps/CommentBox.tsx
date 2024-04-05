"use client";
import React, { useEffect, useState } from "react";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import style from "./commentBox.module.css";
import { useSession } from "next-auth/react";
import CommentForm from "./CommentForm";
import { comment_ref, media_Item } from "@/typeScript/basics";
import { client } from "@/utilities/sanityClient";
// import { set_media_items } from "@/redux_toolkit/features/indexSlice";
// import { useAppDispatch, useAppSelector } from "@/redux_toolkit/hooks";
import { message } from "antd";
import { useSocketContext } from "@/context/socket";

interface Iprops {
  useStates: {
    cmtView: boolean;
    descView: boolean;
    setCmtView: Function;
    setDescView: Function;
  };
  meadia_item: media_Item;
}
const CommentBox = ({ useStates, meadia_item }: Iprops) => {
  const { cmtView, descView, setCmtView, setDescView } = useStates;
  const { data: session } = useSession();
  const socketContext = useSocketContext();
  const [api, setApi] = useState<boolean>(false);
  const [comments, setComments] = useState<
    {
      postedBy: { email: string; name: string };
      comment: string;
      _id: string;
    }[]
  >([]);

  const OnDeleteHandle = async (_id: string) => {
    setApi(true);
    try {
      await client.delete(_id);
      socketContext?.emit.comment_removed(_id, meadia_item._id);
      setComments((pre) => pre.filter((cmt) => cmt._id != _id));
    } catch (error) {
      message.error("internal server error");
      console.error("unable to delete");
    } finally {
      setApi(false);
    }
  };

  async function customEffect() {
    const cmts = await client.fetch(
      `*[_type=="comments" && post._ref=="${meadia_item._id}"]{postedBy->{name,email},_id,comment}`
    );
    setComments(cmts);
  }
  useEffect(() => {
    customEffect();
  }, [meadia_item._id]);

  useEffect(() => {
    socketContext?.on.comment_created((cmt) => {
      if (cmt.post === meadia_item._id) {
        setComments((pre) => [cmt, ...pre]);
      }
    });
    socketContext?.on.comment_removed((cmt_id, post_id) => {
      if (post_id === meadia_item._id) {
        setComments((pre) => pre.filter((cmt) => cmt._id != cmt_id));
      }
    });
    return () => {
      socketContext?.offListners.comment_created();
      socketContext?.offListners.comment_removed();
    };
  }, [session,socketContext?.socket?.connected, socketContext?.on, socketContext?.offListners, meadia_item._id]);

  return (
    <>
      {!descView && (
        <div className={`${style.commentBox} ${cmtView ? "h-full" : ""} `}>
          <div className={`${style.commentBoxInnerDiv}  `}>
            {comments?.map((cmnt, i) => {
              const { comment, postedBy, _id } = cmnt;
              const { name, email } = postedBy;
              return (
                <div
                  key={comment + i}
                  className={`${style.comment}`}
                  style={{ display: cmtView ? " " : i == 0 ? "" : "none" }}
                >
                  <span className="">
                    <button className={style.Img}></button>
                    <p>{name ? name : "unknown"}</p>

                    {email == session?.user?.email && (
                      <button
                        onClick={() => OnDeleteHandle(_id)}
                        disabled={api}
                      >
                        <RiDeleteBinLine />
                      </button>
                    )}
                  </span>
                  <p>{cmtView ? comment : comment.slice(0, 50) + "....."}</p>
                </div>
              );
            })}
            {!comments.length && (
              <p className="w-full text-center font-medium ">
                No comments yet!
              </p>
            )}
          </div>

          <span
            className={`${style.commentBoxSpan} ${cmtView ? "mt-[80%]" : ""} `}
          >
            {cmtView && session && (
              <div className="w-full ">
                <CommentForm
                  meadia_item={meadia_item}
                  setComments={setComments}
                />
              </div>
            )}
            <button
              className=""
              onClick={() => {
                setCmtView(!cmtView);
                setDescView(false);
              }}
            >
              {cmtView ? (
                <MdExpandLess className="p-0" />
              ) : (
                <MdExpandMore className="p-0" />
              )}
            </button>
          </span>
        </div>
      )}
    </>
  );
};

export default CommentBox;
