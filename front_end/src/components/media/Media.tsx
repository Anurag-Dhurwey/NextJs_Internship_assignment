"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getFileAsset } from "@sanity/asset-utils";
import { meadiaFile } from "@/typeScript/basics";
import { useTheme } from "@mui/material/styles";
import MobileStepper from "@mui/material/MobileStepper";
import Button from "@mui/material/Button";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

export const videoFormates = ["webm", "mp4", "avi", "ogg"];
export const imgFormates = ["jpeg", "jpg", "png", "svg", "gif"];

const Media = ({
  meadiaFiles,
  profileView,
}: {
  meadiaFiles: meadiaFile[];
  profileView?: boolean;
}) => {
  const [files, setFiles] = useState<{ url: string; type?: string | null }[]>(
    []
  );
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
   files.length-1>activeStep&& setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
  activeStep>0&&  setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  function getFileExtensionFromUrl(url: string) {
    const urlParts = url.split(".");
    if (urlParts.length > 1) {
      return urlParts.pop()?.toLowerCase();
    }
    return null; // No file extension found
  }
 
  const [imgCover, setImgCover] = useState<boolean>(false);

  useEffect(() => {
    setFiles([]);
    meadiaFiles?.forEach((item) => {
      const url = getFileAsset(item.asset, {
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: "production",
      }).url;
      setFiles((pre) => [...pre, { url, type: getFileExtensionFromUrl(url) }]);
    });
  }, [meadiaFiles]);

  return (
    <>
      <span
        className="flex justify-center items-center w-full h-full"
        onClick={() => setImgCover(!imgCover)}
      >
        <span>
          {!files[activeStep]?.type ||
            (!files[activeStep]?.url && <p>Asset not found</p>)}

          {files[activeStep]?.type && files[activeStep]?.url && (
            <>
              {videoFormates.includes(files[activeStep].type!) && (
                <video
                  controls
                  src={files[activeStep].url}
                  className=" max-h-[395px] rounded-md"
                />
              )}

              {imgFormates.includes(files[activeStep].type!) && (
                <Image
                  src={files[activeStep].url}
                  alt="post"
                  width={1000}
                  height={1000}
                  className={`max-h-[395px] ${
                    !imgCover ? " object-cover" : "h-auto w-auto"
                  } rounded-md `}
                />
              )}
            </>
          )}
        </span>
      </span>
      {!profileView && files.length > 1 && (
        <MobileStepper
          style={{ position: "absolute", bottom: "0" }}
          variant="dots"
          steps={files.length}
          position="static"
          activeStep={activeStep}
          sx={{ maxWidth: 400, flexGrow: 1 }}
          nextButton={
            <Button
              size="small"
              onClick={handleNext}
              disabled={activeStep === files.length}
            >
              Next
              {theme.direction === "rtl" ? (
                <KeyboardArrowLeft />
              ) : (
                <KeyboardArrowRight />
              )}
            </Button>
          }
          backButton={
            <Button
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              {theme.direction === "rtl" ? (
                <KeyboardArrowRight />
              ) : (
                <KeyboardArrowLeft />
              )}
              Back
            </Button>
          }
        />
      )}
    </>
  );
};

export default Media;
