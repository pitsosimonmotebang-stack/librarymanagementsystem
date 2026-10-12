import React, { useEffect } from "react";

// How long a message stays on the screen (in milliseconds).
const MESSAGE_TIME = 5000;

// Shows a green (success) or red (error) message box.
// If there is no text then nothing is shown at all.
// After 5 seconds the message removes itself by calling props.onDismiss.
function Message(props) {
  const text = props.text;
  const onDismiss = props.onDismiss;

  // This is the "lifecycle" part:
  // - When a message appears, start a timer.
  // - The function we return is the CLEANUP. React runs it when the message
  //   changes or the component is removed, so an old timer can never clear
  //   a newer message by mistake (or run after the page was closed).
  useEffect(
    function () {
      let timerId = null;

      if (text && onDismiss) {
        timerId = setTimeout(onDismiss, MESSAGE_TIME);
      }

      return function () {
        if (timerId !== null) {
          clearTimeout(timerId);
        }
      };
    },
    [text, onDismiss]
  );

  if (!text) {
    return null;
  }

  let boxClass = "message message-success";
  if (props.type === "error") {
    boxClass = "message message-error";
  }

  return <div className={boxClass}>{text}</div>;
}

export default Message;
