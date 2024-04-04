"use client";
import React, { useEffect, useState } from "react";
import { uploadForm, media_Item } from "@/typeScript/basics";
import style from "./upload.module.css";
import { useAppDispatch, useAppSelector } from "@/redux_toolkit/hooks";
import { useSession } from "next-auth/react";
import { client } from "@/utilities/sanityClient";
import { getMediaItems } from "@/utilities/functions/getMediaItems";
// import { socketIoConnection } from "@/utilities/socketIo";
import { message } from "antd";
import { getAssetId } from "@/utilities/functions/getAssetId";
import { imgFormates, videoFormates } from "@/components/media/Media";
import { getAdminData } from "@/utilities/functions/getAdminData";
import { set_media_items } from "@/redux_toolkit/features/indexSlice";

const Page = () => {
  const dispatch = useAppDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  const admin = useAppSelector((state) => state.hooks.admin);
  const meadia_items = useAppSelector((state) => state.hooks.media_Items);
  const { data: session } = useSession();
  const [formStatus, setFormStatus] = useState<
    "success" | "failed" | "uploading"
  >();
  const [validationError, setValidationError] =
    useState<{ name: string; message: string }[]>();
  const [form, setForm] = useState<uploadForm>({
    caption: "",
    desc: "",
    filePath: "",
  });
  const [file, setFile] = useState<File>();

  const onChageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    const file = e.target.files;
    if (file) {
      setValidationError(undefined);
      setFile(file[0]);
      setForm({ ...form, filePath: e.target.value });
      checkFileSize({ file: file[0], setValidationError });
      checkFileType({ file: file[0], setValidationError });
    }
  };

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      session &&
      file &&
      admin._id &&
      admin.email &&
      !validationError &&
      !formStatus
    ) {
      setFormStatus("uploading");
      try {
        const uploadedAssetRes = await client.assets.upload("file", file, {
          contentType: file.type,
          filename: file.name+`_${Date.now()}`,
        });
        const asset = {
          _type: "assets",
          file: {
            _type: "reference",
            _ref: uploadedAssetRes._id,
          },
          postedBy: {
            _type: "reference",
            _ref: admin._id,
          },
        };
        await client.create(asset);
        const doc = {
          _type: "post",
          meadiaFile: {
            _type: "file",
            asset: {
              _type: "reference",
              _ref: uploadedAssetRes._id,
            },
          },
          postedBy: {
            _type: "reference",
            _ref: admin._id,
          },
          caption: form.caption,
          desc: form.desc,
          tag: "",
        };
        const createdPost = await client.create(doc);
        createdPost.postedBy = {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
        } as any;
        dispatch(set_media_items([createdPost as any, ...meadia_items]));
        messageApi.success("Published Successfully");
        setFormStatus("success");
        setForm({ caption: "", desc: "", filePath: "" });
        setFile(undefined);
      } catch (error) {
        messageApi.error("unable to publish, try again later");
        setFormStatus("failed");
        console.error(error);
      }
    } else if (validationError?.length) {
      alert(validationError[0].message);
    } else if (formStatus) {
      alert("uploading, please wait!");
    } else {
      console.log("session not found");
    }
  };

  async function withUseEffect() {
    if (session) {
      await getAdminData({ dispatch, admin, session });
      if (!meadia_items.length) {
        getMediaItems({ dispatch, messageApi });
      }
    }
  }
  useEffect(() => {
    withUseEffect();
  }, [session]);

  if (!session) {
    return null;
  }
  return (
    <div className={style.uploadMainDiv}>
      {contextHolder}
      {formStatus === "uploading" && (
        <div className={`${style.uploadingModal}`}>
          <h2 className=" font-bold text-center text-lg text-green-900">
            Uploading...
          </h2>
        </div>
      )}
      <div className={style.chiledOfUploadMainDiv}>
        <form onSubmit={(e) => onSubmitHandler(e)} className={`${style.form} `}>
          <div>
            <label htmlFor="caption">Caption</label>
            <input
              required
              minLength={2}
              id="caption"
              name="caption"
              type="text"
              onChange={(e) => onChageHandler(e)}
              value={form.caption}
            />
          </div>

          <div>
            <label htmlFor="desc">Description</label>
            <textarea
              minLength={6}
              rows={2}
              id="desc"
              name="desc"
              onChange={(e) => onChageHandler(e as any)}
              value={form.desc}
            />
          </div>

          <div>
            <label htmlFor="file">Upload File</label>
            <input
              required
              id="file"
              name="filePath"
              type="file"
              onChange={(e) => onChageHandler(e)}
              value={form.filePath}
              accept="video/* ,image/png, image/jpeg, image/svg, image/gif"
            />

            {validationError &&
              validationError.length > 0 &&
              validationError?.map((error, i) => {
                return (
                  <p className={style.validationError} key={i}>
                    {error.message}
                  </p>
                );
              })}
          </div>

          <button type="submit" className={style.uploadButton}>
            Publish
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;

function checkFileSize({ file, setValidationError }: checkFile) {
  const size: boolean = file.size <= 1000 * 1024 * 10;
  if (!size) {
    const errorDoc = {
      name: "size",
      message: "File size should be less than 10 MB",
    };
    setValidationError((pre) => {
      return pre ? [...pre, errorDoc] : [errorDoc];
    });
  }
}

function checkFileType({ file, setValidationError }: checkFile) {
  const fileType = file.type.split("/").pop();
  if (fileType) {
    const check =
      videoFormates.includes(fileType) || imgFormates.includes(fileType);
    if (!check) {
      const errorDoc = {
        name: "type",
        message: `sorry ${file.type} file not supported yet`,
      };
      setValidationError((pre) => {
        return pre ? [...pre, errorDoc] : [errorDoc];
      });
    }
  } else {
    const errorDoc = {
      name: "type",
      message: `sorry file extension not found`,
    };
    setValidationError((pre) => {
      return pre ? [...pre, errorDoc] : [errorDoc];
    });
  }
}

interface checkFile {
  file: File;
  setValidationError: React.Dispatch<
    React.SetStateAction<
      | {
          name: string;
          message: string;
        }[]
      | undefined
    >
  >;
}

export interface stageType {
  stageOne: "start" | "failed" | "completed" | null;
  stageTwo: "start" | "failed" | "completed" | null;
}
