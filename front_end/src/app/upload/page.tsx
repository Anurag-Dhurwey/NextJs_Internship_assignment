"use client";
import React, { useEffect, useState } from "react";
import { uploadForm, media_Item } from "@/typeScript/basics";
import style from "./upload.module.css";
import { Upload } from "@/components";
import { useAppDispatch, useAppSelector } from "@/redux_toolkit/hooks";
import { useSession } from "next-auth/react";
import { client } from "@/utilities/sanityClient";
import { getMediaItems } from "@/utilities/functions/getMediaItems";
// import { socketIoConnection } from "@/utilities/socketIo";
import { message } from "antd";
import { SanityAssetDocument } from "next-sanity";
import { v4 } from "uuid";
import { getAssetId } from "@/utilities/functions/getAssetId";
import { imgFormates, videoFormates } from "@/components/media/Media";

const Page = () => {
  const dispatch = useAppDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  const admin = useAppSelector((state) => state.hooks.admin);
  const meadia_items = useAppSelector((state) => state.hooks.media_Items);
  const { data: session } = useSession();
  // the below stage will be initially null and it will accept string ("start" || "failed"|| "completed")
  // stageOne is uploading asset and stageTwo is publishing post
  const [stage, setStage] = useState<stageType>({
    stageOne: null,
    stageTwo: null,
  });
  const [onSuccess, setOnSuccess] = useState<{
    asset: boolean | null;
    post: boolean | null;
  }>({ asset: null, post: null });
  const [modal, setModal] = useState<Boolean>(false);
  const [isPosting, setIsPosting] = useState<{ asset: boolean; post: boolean }>(
    { asset: false, post: false }
  );
  const [isFileValid, setIsFileValid] =
    useState<{ name: string; message: string }[]>();
  const [form, setForm] = useState<uploadForm>({
    caption: "",
    desc: "",
    filePath: "",
  });
  const [uploadedAsset, setUploadedAsset] = useState<SanityAssetDocument>();
  const [file, setFile] = useState<File>();

  const onChageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    const file = e.target.files;

    if (file) {
      setIsFileValid(undefined);
      setFile(file[0]);
      setForm({ ...form, filePath: e.target.value });
      checkFileSize({ file: file[0], setIsFileValid });
      checkFileType({ file: file[0], setIsFileValid });
    }
  };

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      session &&
      file &&
      admin._id &&
      admin.email &&
      !isFileValid &&
      !isPosting.asset &&
      !isPosting.post
    ) {
      setIsPosting({ asset: true, post: false });
      setStage({ stageOne: "start", stageTwo: null });
      setModal(true);
      try {

        const uploadedAssetRes = await client.assets.upload("file", file, {
          contentType: file.type,
          filename: file.name,
        });


        if (uploadedAssetRes) {
          const doc= {
            _key: v4(),
            asset: {
              _type: "reference",
              _ref: uploadedAssetRes._id,
            },
          }
          const assetId = admin.assetId
            ? admin.assetId
            : await getAssetId({
                email: admin.email,
                userId: admin._id,
                dispatch,
              });
          if (assetId) {
            const res: createdAssetResType = await client
              .patch(assetId)
              .setIfMissing({ assets: [] })
              .insert("after", "assets[-1]", [
               doc
              ])
              .commit();
            const check = res.assets.find(
              (ast) => ast.asset._ref == uploadedAssetRes._id
            );
            console.log({ res, check });
            if (!check) {
              throw new Error("unable to upload asset");
            }
          } else {
            const asset = {
              _type: "asset",
              assets: [
                doc
              ],
              email: admin.email,
              userId: admin._id,
            };
            const createdAsset = await client.create(asset);
          }
          setUploadedAsset(uploadedAssetRes);
          setOnSuccess({ asset: true, post: null });
          setStage({ stageOne: "completed", stageTwo: null });

        }



      } catch (error) {
        setOnSuccess({ asset: false, post: null });
        setStage({ stageOne: "failed", stageTwo: null });
        console.error(error);
      } finally {
        setIsPosting({ asset: false, post: false });
      }
    } else if (isFileValid) {
      alert(isFileValid[0].message);
    } else if (isPosting.asset) {
      alert("Asset is uploading, please wait!");
    } else {
      console.log("session not found");
    }
  };

  function withUseEffect() {
    if (session) {
      // socketIoConnection({
      //   session,
      //   dispatch,
      //   admin,
      //   message,
      // });
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
      <Upload
        form={form}
        uploadedFileRes={uploadedAsset}
        setIsPosting={setIsPosting}
        setOnSuccess={setOnSuccess}
        visibility={modal}
        setVisibility={setModal}
        isPosting={isPosting}
        onSuccess={onSuccess}
        stage={stage}
        setStage={setStage}
      />
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
            <input
              minLength={6}
              id="desc"
              name="desc"
              type="text"
              onChange={(e) => onChageHandler(e)}
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

            {isFileValid &&
              isFileValid.length > 0 &&
              isFileValid?.map((error, i) => {
                return (
                  <p className={style.validationError} key={i}>
                    {error.message}
                  </p>
                );
              })}
          </div>

          <button type="submit" className={style.uploadButton}>
            Upload
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;

function checkFileSize({ file, setIsFileValid }: checkFile) {
  const size: boolean = file.size <= 1000 * 1024 * 10;
  if (!size) {
    const errorDoc = {
      name: "size",
      message: "File size should be less than 10 MB",
    };
    setIsFileValid((pre) => {
      return pre ? [...pre, errorDoc] : [errorDoc];
    });
  }
}

function checkFileType({ file, setIsFileValid }: checkFile) {
  const fileType = file.type.split("/").pop();
  if (fileType) {
    const check =
      videoFormates.includes(fileType) || imgFormates.includes(fileType);
    if (!check) {
      const errorDoc = {
        name: "type",
        message: `sorry ${file.type} file not supported yet`,
      };
      setIsFileValid((pre) => {
        return pre ? [...pre, errorDoc] : [errorDoc];
      });
    }
  } else {
    const errorDoc = {
      name: "type",
      message: `sorry file extension not found`,
    };
    setIsFileValid((pre) => {
      return pre ? [...pre, errorDoc] : [errorDoc];
    });
  }
}

interface checkFile {
  file: File;
  setIsFileValid: React.Dispatch<
    React.SetStateAction<
      | {
          name: string;
          message: string;
        }[]
      | undefined
    >
  >;
}

interface createdAssetResType {
  assets: [{ _key: string; asset: { _ref: string; _type: string } }];
}

export interface stageType {
  stageOne: "start" | "failed" | "completed" | null;
  stageTwo: "start" | "failed" | "completed" | null;
}

