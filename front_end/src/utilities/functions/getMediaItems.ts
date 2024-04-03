import { media_Item } from "@/typeScript/basics";
import { client } from "../sanityClient";
import { MessageInstance } from "antd/es/message/interface";
import { set_media_items } from "@/redux_toolkit/features/indexSlice";
interface states {
  dispatch: Function;
  // set_media_items: (payload:Array<media_Item>)=>void;
  messageApi:MessageInstance;
}

export const getMediaItems = async ({ dispatch, messageApi }: states) => {
  try {
    const media:Array<media_Item> = await client.fetch(
      `*[_type == "post"]{_id,_createdAt,_updatedAt,caption,desc,meadiaFile,postedBy->,tag,comments[]{_key,comment,postedBy->{name,email,_id}},likes[]{_key,postedBy->{name,email,_id}}}`
    );
    dispatch(set_media_items(media));
    console.log(media);
    return media;
  } catch (error) {
    messageApi.error('not connected to internet')
  }
};
