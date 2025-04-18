// src/main.tsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { fetchAuthSession } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const Root = () => {
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (isGuest) {
      const loginAsGuest = async () => {
        try {
          const session = await fetchAuthSession();
          console.log("Guest identity ID:", session.identityId);
          console.log("Temporary credentials:", session.credentials);
        } catch (err) {
          console.error("Guest login failed:", err);
        }
      };
      loginAsGuest();
    }
  }, [isGuest]);

  if (isGuest) {
    return (
      <Authenticator.Provider>
        <App isGuest={isGuest} />
      </Authenticator.Provider>
    );
  } else {
    return (
      <div
        style={{ padding: "2rem", textAlign: "center", position: "relative" }}
      >
        <button
          className="button-signin"
          style={{
            zIndex: "413",
            position: "absolute",
            bottom: "411px", // adjust as needed
            left: "50%",
            transform: "translateX(-50%)",
            padding: "3px",
          }}
          onClick={() => setIsGuest(true)}
        >
          Continue as Guest
        </button>

        <Authenticator>
          <App isGuest={isGuest} />
        </Authenticator>
      </div>
    );
  }
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
