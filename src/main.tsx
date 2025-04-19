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
import { getOrCreateGuestId } from "./components/CreateID";
Amplify.configure(outputs);

const Root = () => {
  const [isGuest, setIsGuest] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(true);

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

  const handleGuestLogin = () => {
    setIsGuest(true); // Set to guest mode
    setButtonVisible(false); // Hide the button
  };

  if (isGuest) {
    getOrCreateGuestId();
    console.log("guest id is ", getOrCreateGuestId());
    return (
      <Authenticator.Provider>
        <App isGuest={isGuest} setButtonVisible={setButtonVisible} />
      </Authenticator.Provider>
    );
  } else {
    return (
      <div
        style={{ padding: "2rem", textAlign: "center", position: "relative" }}
      >
        {buttonVisible && (
          <button
            className="button-signin"
            style={{
              marginTop: "2rem",
            }}
            onClick={handleGuestLogin}
          >
            Continue as Guest
          </button>
        )}
        <Authenticator>
          <App isGuest={isGuest} setButtonVisible={setButtonVisible} />
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
