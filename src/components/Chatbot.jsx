import { useEffect } from "react";

export default function Chatbot() {
  useEffect(() => {
    // Script 1: Webchat client
    const script1 = document.createElement("script");
    script1.src = "https://cdn.botpress.cloud/webchat/v3.3/inject.js";
    script1.defer = true;

    script1.onload = () => {
      // Only load config.js after inject.js is ready
      const script2 = document.createElement("script");
      script2.src = "https://files.bpcontent.cloud/2025/10/01/11/20251001115240-1V5HKWUX.js";
      script2.defer = true;
      document.body.appendChild(script2);
    };

    document.body.appendChild(script1);

    return () => {
      document.body.removeChild(script1);
    };
  }, []);

  return null; 
}
