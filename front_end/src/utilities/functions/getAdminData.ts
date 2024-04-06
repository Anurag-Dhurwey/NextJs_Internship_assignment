import { client } from "../sanityClient";
import { MessageInstance } from "antd/es/message/interface";
import {
  session,
  admin,
  _ref,
  usr_and_key_in_array,
} from "@/typeScript/basics";
import { set_Admin } from "@/redux_toolkit/features/indexSlice";
interface states {
  dispatch: Function;
  // set_Admin: (action: admin) => void;
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
  if (session?.user?.email && session?.user?.name && session?.user?.image) {
    if (!admin?._id) {
      try {
        const res: Array<resType> = await client.fetch(
          `*[(_type=="user" && email=="${session.user.email}")]{_type,_id,bio,desc,link,image}`
        );
        const user = res[0];
        if (user) {
          const { _id, bio, desc, link } = user;
          const obj={
            _id: _id,
            name: session.user.name,
            email: session.user.email,
            image: user.image ? user.image : session.user.image,
            bio: bio ? bio : undefined,
            desc: desc ? desc : undefined,
            link: link ? link : undefined,
          }
          dispatch(
            set_Admin(obj)
          );
          return obj
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
  _id: string;
  bio?: string;
  desc?: string;
  link?: string;
  image?: string;
  _type: string;
};


