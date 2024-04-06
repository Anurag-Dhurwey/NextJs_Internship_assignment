import {
  set_suggestedData,
} from "@/redux_toolkit/features/indexSlice";
import { client } from "../sanityClient";
import { admin, session, suggestedData, users } from "@/typeScript/basics";
// import { MessageInstance } from "antd/es/message/interface";

type argType = {
  session?: session;
  dispatch: Function;
};

async function getSuggestedUsers({ session, dispatch }: argType) {
  try {
    const resArr: Array<resType> = await client.fetch(
      `*[(_type=="user" && email != "${
        session?.user?.email || " "
      }")  ]{_type,_id,name,image,email}`
    );
    console.log({resArr})
    dispatch(set_suggestedData({ _type: "users", data: resArr }));

    return resArr;
  } catch (error) {
    console.error(error);
  }
}

export { getSuggestedUsers };

interface resType {
  _type: string;
  _id: string;
  email: string;
  name: string;
  image?: string;
}
