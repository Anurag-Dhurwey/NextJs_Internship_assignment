import { client } from "../sanityClient";
import { MessageInstance } from "antd/es/message/interface";
import {
  session,
  admin,
  _ref,
} from "@/typeScript/basics";
import { set_Admin } from "@/redux_toolkit/features/indexSlice";
interface states {
  dispatch: Function;
  admin: admin;
  session: session;
  messageApi?: MessageInstance;
}

export const getAdminData = async ({
  dispatch,
  admin,
  session,
  messageApi,
}: states) => {
  if (session?.user?.email) {
    if (!admin?._id) {
      try {
        const res: Array<resType> = await client.fetch(
          `*[(_type=="user" && email=="${session.user.email}")]{_type,name,_id,bio,desc,link,image}`
        );
        const user = res[0];
        if (user) {
          // const { _id, bio, desc, link } = user;
          const obj = {
            _id: user._id,
            email: session.user.email,
            name: session.user.name || user.name,
            image: session.user.image || user.image,
            bio: user.bio,
            desc: user.desc,
            link: user.link,
          };
          dispatch(set_Admin(obj));
          return obj;
        }
      } catch (error) {
        console.error(error);
        messageApi?.error(`internal server error `);
      }
    } else {
      return admin;
    }
  } else {
    console.log("can not find user on sessions");
  }
};

type resType = {
  name?: string;
  _id: string;
  bio?: string;
  desc?: string;
  link?: string;
  image?: string;
  _type: string;
};
