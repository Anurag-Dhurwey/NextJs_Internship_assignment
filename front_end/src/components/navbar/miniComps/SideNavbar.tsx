import React from "react";
import Link from "next/link";
import style from "./sidenavBar.module.css";
import { MdOutlineClose } from "react-icons/md";
import { useSession } from "next-auth/react";
import { route } from "@/typeScript/basics";
const SideNavbar = ({
  setSideNavbar,
  navRoutes,
}: {
  setSideNavbar: Function;
  navRoutes:  route[];
}) => {
  const { data: session } = useSession();
  return (
    <div className=" absolute top-0 left-0 h-screen  min-w-[220px] w-[70vw] bg-[#00ffffd0] rounded-sm py-[3px] px-[5px]">
      <button onClick={() => setSideNavbar(false)}>
        <MdOutlineClose
          style={{ fontSize: "x-large", fontWeight: "600", color: "black" }}
        />
      </button>

      <div className={style.mobileNavRoutes}>
        <ul>
          {navRoutes.map((nav, i) => {
            const {Icon,path}=nav
            return (
              <li key={path + i}>
                <button>
                  <Link href={nav.protected
                        ? session?.user
                          ? `/${path}`
                          : "/login"
                        : `/${path}`}>
                    {<Icon/>}
                    </Link>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default SideNavbar;
