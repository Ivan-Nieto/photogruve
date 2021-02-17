import React, { useState, useEffect } from "react";
import { useTheme, Theme, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    border: `1px solid ${theme.palette.grey[200]}`,
  },
}));

interface Image {
  thumbUrl: {
    portrait: string;
    landscape: string;
  };
  url: string;
  resolution: { width: number; height: number; ratio: string };
  tags: string[];
  collection: string[];
  visibility: string;
  rating: number;
  description: string;
  name: string;
  author: string;
  createDate: any;
  favorites: number;
  views: number;
  allowDownload: boolean;
  metadata: Record<string, any>;
}

interface DisplayImageProps {
  size?: "small" | "large";
  image: Image;
}

const DisplayImage = ({ size, image }: DisplayImageProps) => {
  const theme = useTheme();
  const classes = useStyles(theme);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const portraitLarge = image?.thumbUrl?.portrait;
    const portraitSmall = image?.thumbUrl?.portrait;
    const landscapeLarge = image?.thumbUrl?.landscape;
    const landscapeSmall = image?.thumbUrl?.landscape;

    const defaultImage =
      portraitSmall || portraitLarge || landscapeLarge || landscapeSmall;

    switch (size) {
      case "large":
        setUrl(portraitLarge || defaultImage);
        break;
      case "small":
        setUrl(portraitSmall || defaultImage);
        break;
      default:
        setUrl(defaultImage);
    }
  }, [size, setUrl, image]);

  return (
    <img
      src={url}
      alt={""}
      className={classes.root}
      width={size === "small" ? 300 : 680}
      height={size === "small" ? 200 : 400}
    />
  );
};

export default DisplayImage;