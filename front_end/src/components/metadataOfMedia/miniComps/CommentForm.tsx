"use client";
import { useAppSelector, useAppDispatch } from "@/redux_toolkit/hooks";
import { set_media_items } from "@/redux_toolkit/features/indexSlice";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { IoMdSend } from "react-icons/io";
import { comment_ref, media_Item } from "@/typeScript/basics";
import { message } from "antd";
import { client } from "@/utilities/sanityClient";
// import { v4 } from "uuid";
import { getAdminData } from "@/utilities/functions/getAdminData";
import { useSocketContext } from "@/context/socket";

const CommentForm = ({ meadia_item, setComments }: props) => {
  const socketContext = useSocketContext();
  const dispatch = useAppDispatch();
  const admin = useAppSelector((state) => state.hooks.admin);
  const { data: session } = useSession();
  // const media_Items = useAppSelector((state) => state.hooks.media_Items);
  const [form, setForm] = useState("");
  const [onSubmit, setOnsubmit] = useState<boolean>(false);

  const onHnandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // const uuid = v4();
    await getAdminData({ dispatch, admin, session });
    // console.log(uuid);
    const formetedFormText = form
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .join(" ");

    if (formetedFormText.length >= 3 && !onSubmit) {
      setOnsubmit(true);
      try {
        const cmt = await client.create({
          _type: "comments",
          postedBy: {
            _type: "reference",
            _ref: admin._id,
          },
          post: {
            _type: "reference",
            _ref: meadia_item._id,
          },
          comment: form,
        });

        if (cmt && admin._id && admin.name && admin.email) {
          cmt.postedBy = { name: admin.name, email: admin.email } as any;

          socketContext?.emit.comment_created({
            _id:cmt._id,
            comment: cmt.comment,
            post: cmt.post._ref,
            postedBy: cmt.postedBy as any,
          });

          setComments((pre) => [cmt as any, ...pre]);
          setForm("");
        }
      } catch (error) {
        console.error(error);
        message.error("comment not posted");
      } finally {
        setOnsubmit(false);
      }
    } else if (onSubmit) {
      alert("submitting");
    } else {
      setForm(formetedFormText);
      alert("text length should be greater then 3");
    }
  };

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(e.target.value);
  };

  return (
    <>
      <form
        onSubmit={(e) =>
          session && admin._id
            ? onHnandleSubmit(e)
            : message.error("login to contineu")
        }
        className="mb-1 gap-x-1 w-full flex justify-center items-center"
      >
        <input
          required
          minLength={3}
          type="text"
          name="comment"
          id="comment"
          className="text-xs px-4 py-1 rounded-lg w-[90%] bg-white"
          value={form}
          onChange={(e) => onChangeHandler(e)}
        />
        <button type="submit" className="text-xs">
          <IoMdSend className="text-lg " />
        </button>
      </form>
    </>
  );
};

export default CommentForm;

interface props {
  meadia_item: media_Item;
  setComments: React.Dispatch<
    React.SetStateAction<
      {
        postedBy: {
          email: string;
          name: string;
        };
        comment: string;
        _id: string;
      }[]
    >
  >;
}
