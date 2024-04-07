import React from "react";
import Link from "next/link";
import style from "./sidenavBar.module.css";
import { MdOutlineClose } from "react-icons/md";
import { useSession } from "next-auth/react";
import { route } from "@/typeScript/basics";
import { Button } from "@mui/material";
const SideNavbar = ({
  setSideNavbar,
  navRoutes,
}: {
  setSideNavbar: Function;
  navRoutes:  route[];
}) => {
  const { data: session } = useSession();
  return (
    <div className=" absolute top-0 left-0 h-screen  min-w-[220px] w-[70vw] bg-[#38c1c1e8] rounded-sm py-[3px] px-[5px]">
      <button onClick={() => setSideNavbar(false)}>
        <MdOutlineClose
          style={{ fontSize: "x-large", fontWeight: "600", color: "black" }}
        />
      </button>

      <div className={style.mobileNavRoutes}>
        <ul>
          {navRoutes.map((nav, i) => {
            const {Icon,path}=nav
            if(nav.protected&&!session){
              return null
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
    </div>
  );
};

export default SideNavbar;
