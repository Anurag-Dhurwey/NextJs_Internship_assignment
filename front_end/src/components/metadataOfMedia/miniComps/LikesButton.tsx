"use client";
import React, { useEffect, useState } from "react";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { useSession } from "next-auth/react";
import { client } from "@/utilities/sanityClient";
import { useAppDispatch, useAppSelector } from "@/redux_toolkit/hooks";
import {  media_Item } from "@/typeScript/basics";
import { message } from "antd";
import { getAdminData } from "@/utilities/functions/getAdminData";
import { useSocketContext } from "@/context/socket";
import { IconButton } from "@mui/material";
import { redirect } from "next/navigation";

const LikesButton = ({ meadia_item }: { meadia_item: media_Item }) => {
  const dispatch = useAppDispatch();
  const socketContext = useSocketContext();
  const { data: session } = useSession();
  const admin = useAppSelector((state) => state.hooks.admin);
  const [isLiked, setIsLiked] = useState<string | false | undefined>(undefined);
  const [totalLikes, setTotalLikes] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);

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
      setLoading(true);

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
        setLoading(false);
      }
    } else {
      console.error("session not found");
      redirect('/auth/signup')
    }
  };

 

  useEffect(() => {
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

    withUseEffect();
  }, [meadia_item, session,admin,dispatch]);

  useEffect(() => {
    socketContext?.on.like((id) => {
      if (id === meadia_item._id && totalLikes != undefined) {
        setTotalLikes((pre) => pre! + 1);
      }
    });
    socketContext?.on.unLike((id) => {
      if (id === meadia_item._id && totalLikes != undefined) {
        setTotalLikes((pre) => {
          return pre! - 1;
        });
      }
    });
    return () => {
      socketContext?.offListners.like();
      socketContext?.offListners.unLike();
    };
  }, [
    session,
    socketContext?.socket?.connected,
    socketContext?.on,
    socketContext?.offListners,
    meadia_item._id,
    totalLikes,
  ]);

  return (
    <>
      <IconButton
          onClick={() => isLiked != undefined && !loading && handleLikeButton()}
          aria-label="delete"
          disabled={loading}
          color="primary"
        >
          <ThumbUpIcon style={{ color: isLiked ? "blue" : "white" }} />
          {!!totalLikes && <p className="text-sm px-1">{totalLikes}</p>}
        </IconButton>
    </>
  );
};

export default LikesButton;
