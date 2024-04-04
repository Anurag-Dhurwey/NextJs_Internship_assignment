import { client } from "@/utilities/sanityClient";
import { NextResponse } from "next/server";
import { uploadForm, admin } from "@/typeScript/basics";

interface Body {
  uploadedFileRes: {
    _id: string;
  };
  user: admin;
  form: uploadForm;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uploadedFileRes, user, form }: Body = body;
    const doc = {
      _type: "post",
      meadiaFile: {
        _type: "file",
        asset: {
          _type: "reference",
          _ref: uploadedFileRes._id,
        },
      },
      postedBy: {
        _type: "reference",
        _ref: user._id,
      },
      caption: form.caption,
      desc: form.desc,
      tag: "",
    };
    const createdPost = await client.create(doc);
    createdPost.postedBy = {
      _id: user._id,
      name: user.name,
      email: user.email,
    } as any;

    (createdPost as any).comments = [];
    (createdPost as any).likes = [];
    return NextResponse.json({ createdPost });
  } catch (error) {
    console.error(error);
  }
}
