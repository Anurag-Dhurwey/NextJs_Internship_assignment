"use client";
import React, {  useState } from "react";
import { uploadForm } from "@/typeScript/basics";
import style from "./upload.module.css";
import { useAppDispatch, useAppSelector } from "@/redux_toolkit/hooks";
import { useSession } from "next-auth/react";
import { client } from "@/utilities/sanityClient";
import { message } from "antd";
import { imgFormates, videoFormates } from "@/components/media/Media";
import { set_media_items } from "@/redux_toolkit/features/indexSlice";
import { SanityAssetDocument } from "next-sanity";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Image from "next/image";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { getFileExtensionFromUrl } from "@/utilities/functions/getFileExtensionFromUrl";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

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
  const [uploadedAssets, setUploadedAssets] = useState<SanityAssetDocument[]>(
    []
  );
  const [assetUploading, setAssetUploading] = useState(false);
  const onChageHandler = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValidationError(undefined);
    setForm({ ...form, [e.target.name]: e.target.value });
    const file = (e.target as any).files;
    if (file) {
      if (
        checkFileSize({ file: file[0], setValidationError }) &&
        checkFileType({ file: file[0], setValidationError })
      ) {
        setAssetUploading(true);
        try {
          const res = await client.assets.upload("file", file[0], {
            contentType: file[0].type,
            filename: `${Date.now()}_` + file[0].name,
          });
          const asset = {
            _type: "assets",
            file: {
              _type: "reference",
              _ref: res._id,
            },
            postedBy: {
              _type: "reference",
              _ref: admin._id,
            },
          };
          await client.create(asset);
          setUploadedAssets((pre) => [res, ...pre]);
          setForm({ ...form, filePath: e.target.value });
        } catch (error) {
          messageApi.error("unable to upload");
        } finally {
          setAssetUploading(false);
        }
      }
    }
  };

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      session &&
      uploadedAssets.length &&
      admin._id &&
      admin.email &&
      !formStatus
    ) {
      setFormStatus("uploading");
      try {
        const doc = {
          _type: "post",
          meadiaFiles: uploadedAssets.map((asset) => ({
            _type: "file",
            asset: {
              _type: "reference",
              _ref: asset._id,
            },
          })),
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
        setUploadedAssets([]);
        setValidationError(undefined);
      } catch (error) {
        messageApi.error("unable to publish, try again later");
        setFormStatus("failed");
        console.error(error);
      }
    } else if (formStatus) {
      alert("uploading, please wait!");
    } else {
      console.log("session not found");
    }
  };

  // useEffect(() => {
  //   async function withUseEffect() {
  //     if (session) {
  //       await getAdminData({ dispatch, admin, session });
  //       if (!meadia_items.length) {
  //         getMediaItems({ dispatch, messageApi });
  //       }
  //     }
  //   }
  //   withUseEffect();
  // }, [session]);

  if (!session) {
    return null;
  }
  return (
    <div
      className={`flex justify-center items-start bg-slate-600 h-screen w-screen py-2`}
    >
      {contextHolder}
      {(formStatus === "uploading" || assetUploading) && (
        <div className={`${style.uploadingModal}`}>
          <Box sx={{ display: "flex" }}>
            <CircularProgress />
          </Box>
        </div>
      )}
      <form
        onSubmit={(e) => onSubmitHandler(e)}
        className="bg-slate-400 rounded-md max-w-[600px] w-full p-5 flex justify-center items-center flex-col gap-2"
      >
        <TextField
          className="w-full"
          fullWidth
          label="Caption"
          required
          id="caption"
          name="caption"
          type="text"
          onChange={(e) => onChageHandler(e)}
          value={form.caption}
        />
        <TextField
          className="w-full"
          required
          type="text"
          multiline
          rows={2}
          id="desc"
          name="desc"
          label="Description"
          onChange={(e) => onChageHandler(e as any)}
          value={form.desc}
        />

        {!!uploadedAssets.length && (
          <div className="flex justify-center items-center gap-2 flex-wrap">
            {uploadedAssets.map((asset, i) => {
              const type = getFileExtensionFromUrl(asset.url);
              if (!type || !asset.url)
                return (
                  <Paper style={{ height: "100px", width: "100px" }} key={i}>
                    <p>error</p>
                  </Paper>
                );
              return (
                <Paper
                  className="flex justify-center items-center h-[100px] w-[100px] rounded-sm"
                  key={i}
                >
                  <>
                    {videoFormates.includes(type) && (
                      <video
                        controls
                        src={asset.url}
                        className=" max-h-[395px] rounded-md"
                      />
                    )}

                    {imgFormates.includes(type) && (
                      <Image
                        src={asset.url}
                        alt="post"
                        width={1000}
                        height={1000}
                        className="h-auto w-auto"
                      />
                    )}
                  </>
                </Paper>
              );
            })}
          </div>
        )}
        <div className="w-full">
          <Button
            className="w-full"
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
          >
            Upload file
            <VisuallyHiddenInput
              required
              id="file"
              name="filePath"
              type="file"
              onChange={(e) => onChageHandler(e)}
              value={form.filePath}
            />
          </Button>
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

        <Button type="submit" className={"w-full my-4"} variant="contained">
          Publish
        </Button>
      </form>
    </div>
  );
};

export default Page;

function checkFileSize({ file, setValidationError }: checkFile) {
  const size: boolean = file.size <= 1000 * 1024 * 5;
  if (!size) {
    const errorDoc = {
      name: "size",
      message: "File size should be less than 5 MB",
    };
    setValidationError((pre) => {
      return pre ? [...pre, errorDoc] : [errorDoc];
    });
  }
  return size;
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
    return check;
  } else {
    const errorDoc = {
      name: "type",
      message: `sorry file extension not found`,
    };
    setValidationError((pre) => {
      return pre ? [...pre, errorDoc] : [errorDoc];
    });
    return false;
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
