"use client";
import React, { useEffect, useState } from "react";
import { AiFillLike } from "react-icons/ai";
import { useSession } from "next-auth/react";
import { client } from "@/utilities/sanityClient";
import { useAppDispatch, useAppSelector } from "@/redux_toolkit/hooks";
import { set_media_items } from "@/redux_toolkit/features/indexSlice";
import { like, like_ref, media_Item } from "@/typeScript/basics";
import { message } from "antd";
import { v4 as uuidv4 } from "uuid";
import { getAdminData } from "@/utilities/functions/getAdminData";
import { useSocketContext } from "@/context/socket";

const LikesButton = ({ meadia_item }: { meadia_item: media_Item }) => {
  const dispatch = useAppDispatch();
  const socketContext = useSocketContext();
  const { data: session } = useSession();
  const admin = useAppSelector((state) => state.hooks.admin);
  // const media_Items = useAppSelector((state) => state.hooks.media_Items);
  const [isLiked, setIsLiked] = useState<string | false | undefined>(undefined);
  const [totalLikes, setTotalLikes] = useState<number>();
  const [api, setApi] = useState<boolean>(false);

  async function like() {
    try {
      const doc = await client.create({
        _type: "likes",
        likedBy: {
          _type: "reference",
          _ref: admin._id,
        },
        post: {
          _type: "reference",
          _ref: meadia_item._id,
        },
      });

      if (doc._id) {
        setIsLiked(doc._id);
      } else {
        console.error("something went wrong");
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function unLike() {
    try {
      if (!isLiked) {
        console.error("id not found");
        return;
      }
      await client.delete(isLiked);
      setIsLiked(false);
    } catch (error) {
      console.error(error);
    }
  }

  const handleLikeButton = async () => {
    if (session?.user && isLiked != undefined) {
      setApi(true);

      try {
        if (isLiked) {
          await unLike();
          totalLikes && setTotalLikes((pre) => pre! - 1);
          socketContext?.emit.unLike(meadia_item._id);
        } else {
          await like();
          setTotalLikes((pre) => (pre != undefined ? pre + 1 : 1));
          socketContext?.emit.like(meadia_item._id);
        }
      } catch (error) {
        console.error(error);
        message.error("Internal server error");
      } finally {
        setApi(false);
      }
    } else {
      console.error("session not found");
      message.error("session not found");
    }
  };

  async function withUseEffect() {
    const like_count = await client.fetch(
      `count(*[ _type == "likes" && post._ref =="${meadia_item._id}" ]._id)`
    );

    setTotalLikes(like_count);

    await getAdminData({ dispatch, admin, session });
    if (!session || !admin._id) {
      setIsLiked(false);
      return;
    }
    const doc = await client.fetch(
      `*[_type == "likes" && post._ref == "${meadia_item._id}" && likedBy._ref == "${admin._id}"]{_id}`
    );
    if (doc.length) {
      setIsLiked(doc[0]._id);
    } else {
      setIsLiked(false);
    }
  }

  useEffect(() => {
    withUseEffect();
  }, [meadia_item, session]);

  useEffect(() => {
    socketContext?.on.like((id) => {
      if (id === meadia_item._id && totalLikes != undefined) {
        setTotalLikes((pre) => pre! + 1);
      }
    });
    socketContext?.on.unLike((id) => {
      if (id === meadia_item._id && totalLikes != undefined) {
        setTotalLikes((pre) => {
          return pre! - 1});
      }
    });
    return ()=>{
      socketContext?.offListners.like()
      socketContext?.offListners.unLike()
    }
  }, [session, socketContext?.socket?.connected,socketContext?.on,socketContext?.offListners, meadia_item._id, totalLikes]);

  return (
    <>
      {isLiked != undefined && (
        <button
          disabled={api}
          onClick={() => handleLikeButton()}
          className="text-2xl"
        >
          <AiFillLike style={{ color: isLiked ? "blue" : "white" }} />
        </button>
      )}
      {!!totalLikes && <p style={{ fontSize: "small" }}>{totalLikes}</p>}
    </>
  );
};

export default LikesButton;
