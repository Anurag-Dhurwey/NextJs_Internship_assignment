"use client";
import AdminProfile from "@/components/profiles/AdminProfile";
import UsersProfile from "@/components/profiles/UsersProfile";
import { useAppDispatch, useAppSelector } from "@/redux_toolkit/hooks";
import { profileSlugObjType } from "@/typeScript/basics";
import { getAdminData } from "@/utilities/functions/getAdminData";
import { message } from "antd";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";

const Page = ({ params }: { params: { slug: string } }) => {
  const { data: session } = useSession();
  const admin = useAppSelector((state) => state.hooks.admin);
  const dispatch = useAppDispatch();
  const slug = params.slug;
  const data: profileSlugObjType = JSON.parse(decodeURIComponent(slug));

  useEffect(() => {
    async function withUseEffect() {
      if (!admin._id) {
        await getAdminData({ dispatch, admin, session, messageApi: message });
      }
    }
    withUseEffect();
  }, [session, admin, dispatch]);

  if (!session && !data.email) return null;

  return (
    <section className="bg-slate-600 h-screen">
      {data.email == session?.user?.email ? (
        <AdminProfile />
      ) : (
        <UsersProfile user={data} />
      )}
    </section>
  );
};

export default Page;
