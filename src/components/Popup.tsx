import React from "react";
import "./Popup.css";

function Popup(props: {
  trigger: boolean;
  setTrigger: (value: boolean) => void;
  children: React.ReactNode;
}) {
  return props.trigger ? (
    <div className="popup-overlay">
      <button className="close-btn" onClick={() => props.setTrigger(false)}>
        No
      </button>
      <div className="popup-content">{props.children}</div>
    </div>
  ) : null;
}

export default Popup;
