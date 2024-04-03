"use client";
import React, { useEffect, useState } from "react";
import { AiFillLike } from "react-icons/ai";
import { useSession } from "next-auth/react";
import { client } from "@/utilities/sanityClient";
import { useAppDispatch, useAppSelector } from "@/redux_toolkit/hooks";
import { set_media_items } from "@/redux_toolkit/features/indexSlice";
import { like, like_ref, media_Item} from "@/typeScript/basics";
import { message } from "antd";
import { v4 as uuidv4 } from "uuid";

const LikesButton = ({ meadia_item }: { meadia_item: media_Item }) => {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const admin = useAppSelector((state) => state.hooks.admin);
  const media_Items = useAppSelector((state) => state.hooks.media_Items);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [btnColor, setBtnColor] = useState<"blue"|"white">();
  const [api, setApi] = useState<boolean>(false);

  async function like() {
    setBtnColor("blue");
    try {
      const res = await client
        .patch(meadia_item._id)
        .setIfMissing({ likes: [] })
        .insert("after", "likes[-1]", [
          {
            _key: uuidv4(),
            postedBy:{
              _type:"reference",
              _ref:admin._id
            }
          },
        ])
        .commit();
      const key: like_ref | undefined = res.likes.find(
        (item: like_ref) => item.postedBy._ref == admin._id
      );
      console.log({ key, isLiked, res });
      if (key?._key) {
        const updatedMeadia_Items = media_Items.map((item) => {
          if (item._id == res._id && admin.email && admin.name && admin._id) {
            const doc={
              _key: key._key,
              postedBy:{
               _id:admin._id,
               name:admin.name,
               email:admin.email
              }
            }
            return {
              ...item,
              likes: item.likes
                ? [
                    ...item.likes,
                   doc
                  ]
                : [
                    doc
                  ],
            };
          } else {
            return item;
          }
        });
        // setIsLiked(true);
        dispatch(set_media_items([...updatedMeadia_Items]));
      } else {
        throw new Error("_key not found");
      }
    } catch (error) {
      setBtnColor("white");
      console.error(error);
    }
  }

  async function unLike() {
    setBtnColor("white")
    try {
      const key = meadia_item.likes?.find(
        (item: like) => item.postedBy.email == admin.email
      );
      if (key?._key) {
        const res = await client
          .patch(meadia_item._id)
          .unset(["likes[0]", `likes[_key=="${key._key}"]`])
          .commit();

        const updatedMeadia_Items = media_Items.map((item) => {
          if (item._id == res._id && admin.email && admin.name && admin._id) {
            const newLikesList = item.likes?.filter((like) => {
              return like.postedBy.email !== admin.email;
            });
            const returnVal = { ...item, likes: newLikesList };
            return returnVal;
          } else {
            return item;
          }
        });
        dispatch(set_media_items([...updatedMeadia_Items]));
      } else {
        throw new Error("_key not found");
      }
    } catch (error) {
      setBtnColor("blue");
      console.error(error);
    }
  }

  const handleLikeButton = async () => {
    if (session && admin._id && admin.email) {
      setApi(true);

      try {
        if (isLiked) {
          await unLike();
        } else {
          await like();
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

  function withUseEffect() {
    const mapLikes = meadia_item.likes?.find((item) => item.postedBy.email == admin.email && item.postedBy._id == admin._id);
    if (mapLikes) {
      setIsLiked(true);
      if(!btnColor){
        setBtnColor("blue");
      }
    }else{
      setIsLiked(false);
     if(!btnColor){
      setBtnColor("white");
     }
    }
  }

  useEffect(() => {
   withUseEffect()
  }, [api, media_Items, session]);

  return (
    <>
      <button
        disabled={api}
        onClick={() => handleLikeButton()}
        className="text-2xl"
      >
        <AiFillLike style={{ color: btnColor }} />
      </button>
    </>
  );
};

export default LikesButton;
