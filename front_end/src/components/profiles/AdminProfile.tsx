"use client";
import style from "./adminProfile.module.css";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { set_my_uploads } from "@/redux_toolkit/features/indexSlice";
import { useAppDispatch, useAppSelector } from "@/redux_toolkit/hooks";
import { client } from "@/utilities/sanityClient";
import Image from "next/image";
import { Media } from "@/components";
import { getAdminData } from "@/utilities/functions/getAdminData";
import { Button } from "@mui/material";
import { signOut } from "next-auth/react";
const AdminProfile = () => {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();

  // const getMyUploads = async () => {
  //   const media = await client.fetch(
  //     `*[_type == "post" && postedBy->email=="${session?.user?.email}"]{_id,caption,desc,meadiaFiles,postedBy->,tag,comments[]{comment,postedBy->}}`
  //   );
  //   dispatch(set_my_uploads(media));
  //   return media;
  // };

  const admin = useAppSelector((state) => state.hooks.admin);
  const { name, email, image, _id } = admin;
  const media_Items = useAppSelector((state) => state.hooks.media_Items);
  const my_uploads = useAppSelector((state) => state.hooks.my_uploads);

  useEffect(() => {
    async function withUseEffect() {
      if (session) {
        if (!my_uploads.length) {
          const media = await client.fetch(
            `*[_type == "post" && postedBy->email=="${session?.user?.email}"]{_id,caption,desc,meadiaFiles,postedBy->,tag,comments[]{comment,postedBy->}}`
          );
          dispatch(set_my_uploads(media));
          return media;
        }
      }
      if (!admin._id) {
        getAdminData({ dispatch, admin, session });
      }
    }
    withUseEffect();
  }, [session, media_Items, dispatch, my_uploads.length, admin]);
  if (!session) {
    return null;
  }
  return (
    <div className={`${style.adminProfileParentDiv} gap-[10px]`}>
      <div
        className={`${style.adminProfile_firstChildDiv} w-full flex-col text-center bg-blue-400 lg:w-[800px] rounded-md `}
      >
        <h3 className="w-full bg-blue-600 rounded-sm py-1">Profile</h3>
        <div className={`${style.adminProfile_firstChildDiv} p-5 flex-wrap`}>
          {admin.image || session.user?.image ? (
            <Image
              src={admin.image! || session!.user!.image!}
              width={1000}
              height={1000}
              alt="profile"
              className={style.adminProfile_firstChildDiv_Image}
            />
          ) : (
            <div className=" h-[100px] w-[100px] rounded-full bg-blue-700 flex justify-center items-center">
              <span className=" uppercase font-extrabold text-4xl text-yellow-700">
                {session?.user?.name?.slice(0, 1)}
              </span>
            </div>
          )}
          <div className="">
            <h4>
              <span>{name || session.user?.name}</span>
            </h4>
            <h4>
              <span>{email || session.user?.email}</span>
            </h4>
          </div>
        </div>
        <Button
          className="w-full text-center mb-1"
          variant="contained"
          onClick={() => signOut({ callbackUrl: "/", redirect: true })}
        >
          LogOut
        </Button>
      </div>
      <div
        className={`${style.adminProfile_secondChildDiv} flex-col text-center bg-blue-400 lg:w-[800px] rounded-md`}
      >
        <h3 className="w-full bg-blue-600 rounded-sm py-1">Uploads</h3>
        <div className={`${style.adminProfile_secondChildDiv} p-5`}>
          {my_uploads?.map((my_post, i) => {
            const { meadiaFiles } = my_post;
            return (
              <div
                key={i}
                className={`${style.mappedUploads} bg-slate-600 rounded-md p-2`}
              >
                <Media meadiaFiles={meadiaFiles} profileView={true} key={i} />
              </div>
            );
          })}
          {!my_uploads.length && <p>No uploades yet </p>}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
