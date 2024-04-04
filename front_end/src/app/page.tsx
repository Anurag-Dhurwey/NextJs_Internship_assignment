"use client";
import { Home } from "@/components";
import { useAppDispatch, useAppSelector } from "@/redux_toolkit/hooks";
import { getAdminData } from "@/utilities/functions/getAdminData";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Root() {
  const admin = useAppSelector((state) => state.hooks.admin);
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  useEffect(() => {
    async function getAdmin() {
      await getAdminData({ dispatch, admin, session });
    }
   !admin._id && getAdmin();
  }, [admin,dispatch,session]);
  return (
    <>
      <Home />
    </>
  );
}
