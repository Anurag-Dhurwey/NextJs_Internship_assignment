"use client";
import React, { useState } from "react";
import { signIn, signOut } from "next-auth/react";
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
import { useSocketContext } from "@/context/socket";
import { route } from "@/typeScript/basics";
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

        <Link href={"/"} className={style.LOGO}>
          <button>LOGO</button>
        </Link>

        <div className={style.navRoutes}>
          <ul>
            {nav.map((nav, i) => {
              const { Icon, path } = nav;
              return (
                <li key={i}>
                  <Link
                    href={
                      nav.protected
                        ? session?.user
                          ? `/${path}`
                          : "/login"
                        : `/${path}`
                    }
                  >
                    {<Icon />}
                  </Link>
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
            <button onClick={() => socketContext.socket?.connect()}>
              <CloudQueueRoundedIcon />
            </button>
          )}
          {!socketContext?.socket?.active &&
            !socketContext?.socket?.connected && (
              <button onClick={() => socketContext?.socket?.disconnect()}>
                <CloudOffRoundedIcon />
              </button>
            )}
          {/* <div className={style.dropdown_content}> */}
          {session && (
            <>
              <button>
                <Link href={`/profile/${slug}`}>Profile</Link>
              </button>
              <button onClick={() => signOut()}>Logout</button>
            </>
          )}
          {!session && (
            <>
              <button onClick={() => signIn()}>LogIn</button>
              <button>
                <Link href={`/auth/signup`}>SignUp </Link>
              </button>
            </>
          )}
          {/* </div> */}
          {session && (
            <Link
              href={`/profile/${slug}`}
              className={style.profile_icon}
            >
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
