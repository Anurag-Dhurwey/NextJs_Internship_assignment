"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import style from "./navbar.module.css";
import { FaBars } from "react-icons/fa";
import { useSession } from "next-auth/react";
import Link from "next/link";
import SideNavbar from "./miniComps/SideNavbar";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";
import CloudQueueRoundedIcon from "@mui/icons-material/CloudQueueRounded";
import CircularProgress from "@mui/material/CircularProgress";
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { useSocketContext } from "@/context/socket";
import { route } from "@/typeScript/basics";
import { Button } from "@mui/material";
const Navbar = () => {
  const socketContext = useSocketContext();
  const nav: route[] = [
    {
      Icon: PersonSearchRoundedIcon,
      title: "search",
      active: true,
      path: "search",
    },
    {
      Icon: CloudUploadRoundedIcon,
      title: "upload",
      active: true,
      path: "upload",
      protected: true,
    },
  ];
  const { data: session } = useSession();
  const [sideNavbar, setSideNavbar] = useState<boolean>(false);
  const slug = encodeURIComponent(JSON.stringify({ ...session?.user }));
  return (
    <div className="max-[430px]:h-[42px] h-[56px]">
      <div
        className={`${style.nav}`}
        style={{ width: "100vw", position: "fixed", top: "0", zIndex: "9" }}
      >
        <span className={style.sideBarForMobile} style={{ zIndex: "10" }}>
          {!sideNavbar && (
            <button onClick={() => setSideNavbar(true)}>
              <FaBars
                style={{ fontSize: "large", fontWeight: "600", color: "black" }}
              />
            </button>
          )}
          {sideNavbar && (
            <SideNavbar setSideNavbar={setSideNavbar} navRoutes={nav} />
          )}
        </span>

        <Link href={"/"}>
          <button>LOGO</button>
        </Link>

        <div className={style.navRoutes}>
          <ul>
            {nav.map((nav, i) => {
              const { Icon, path } = nav;
              if (nav.protected && !session) {
                return null;
              }
              return (
                <li key={path + i} className="w-full text-center bg-cyan-600 rounded-md">
                <Button className="w-full">
                  <Link href={`/${path}`} className=" flex justify-center items-center gap-2 text-white">
                    {<Icon/>}{nav.title}
                    </Link>
                </Button>
              </li>
              );
            })}
          </ul>
        </div>

        <div className={style.right}>
          {socketContext?.socket?.active &&
            !socketContext?.socket?.connected && (
              <button>
                <CircularProgress size={20} />
              </button>
            )}
          {socketContext?.socket?.connected && (
            <button onClick={() => socketContext.socket?.disconnect()}>
              <CloudDoneIcon className="text-green-900" />
            </button>
          )}
          {!socketContext?.socket?.active &&
            !socketContext?.socket?.connected && (
              <button onClick={() => socketContext?.socket?.connect()}>
                <CloudOffRoundedIcon />
              </button>
            )}

          {!session && (
            <>
              <Button className="text-center bg-cyan-600 text-white p-1" onClick={() => signIn()}>LogIn</Button>
              <Button className="text-center bg-cyan-600 text-white p-1">
                <Link href={`/auth/signup`}>SignUp </Link>
              </Button>
            </>
          )}
          {session && (
            <Link href={`/profile/${slug}`} className={style.profile_icon}>
              <span className=" uppercase font-extrabold text-2xl text-yellow-700">
                {session?.user?.name?.slice(0, 1)}
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
