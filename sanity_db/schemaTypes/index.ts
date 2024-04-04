import account from "./account";
import assets from "./assets";
import comments from "./comments";
import likes from "./likes";
// import comment from "./objects/comment";
// import like from "./objects/like";
import post from "./post";
import postRef from "./references/postRef";
// import userRef from "./references/userRef";
import user from "./user";
import verification_token from "./verification_token";

export const schemaTypes = [assets,user,account,verification_token,post,postRef,likes,comments]
