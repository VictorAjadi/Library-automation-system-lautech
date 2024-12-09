import { useEffect } from "react";
import useImage from "./useImage";

const useBodyBackground = (isLogin = false) => {
  const background = useImage().backgroundImage;
  useEffect(() => {
    // Apply background styles
    document.body.style.backgroundImage = `url("${background}")`;
    document.body.style.backgroundSize = "cover"; // Scales the background image to cover the entire viewport
    document.body.style.backgroundRepeat = "no-repeat"; // Prevents the background from repeating
    document.body.style.backgroundPosition = "center"; // Centers the background image
    document.body.style.height = isLogin ? "100vh" : "100%"; // Ensure the body occupies the full viewport height
    document.body.style.margin = "0"; // Remove any default margin

    // Cleanup function to reset styles
    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundRepeat = "";
      document.body.style.backgroundPosition = "";
      document.body.style.height = "";
      document.body.style.margin = "";
    };
  }, [isLogin]);
};

export default useBodyBackground;
