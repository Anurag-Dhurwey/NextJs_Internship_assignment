"use client";
import React, { useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import { useAppDispatch, useAppSelector } from "@/redux_toolkit/hooks";
import { getSuggestedUsers } from "@/utilities/functions/getSuggestedUsers";
import { useSession } from "next-auth/react";
const Search = () => {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const { users } = useAppSelector((state) => state.hooks.suggestedData);
  useEffect(() => {
    async function getUsers() {
      if (!users.length) {
       await getSuggestedUsers({ session, dispatch });
      }
    }
    getUsers();
  }, []);
  return (
    <section className="bg-slate-600 h-screen flex justify-start items-center flex-col gap-2">
     
      <div className="flex justify-center items-center flex-col w-full max-w-[1000px] text-center bg-blue-400 rounded-md">
        <h3 className="w-full bg-blue-600  py-1">Users</h3>
        <div className="flex justify-center items-center flex-wrap gap-2 p-2">
          {users?.map((usr, i) => {
            return (
              <div
                key={i}
                className="rounded-md overflow-hidden gap-1 flex justify-center items-center flex-col w-[100px] h-[100px] bg-gray-700"
              >
                <Avatar
                  alt="Remy Sharp"
                  src={usr.image}
                  sx={{ width: 56, height: 56,padding:'3px' }}
                />
                <p className=" text-xs w-full bg-slate-500 p-1 text-center">{usr.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Search;
