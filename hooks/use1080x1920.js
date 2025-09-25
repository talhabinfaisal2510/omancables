import { useMediaQuery } from "@mui/material";

export const use1080x1920 = () => {
  // Target exactly 1080px × 1920px resolution
  const is1080x1920 = useMediaQuery("(width: 1080px) and (height: 1920px)");

  return is1080x1920;
};
