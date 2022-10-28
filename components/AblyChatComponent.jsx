import React, { useEffect, useState } from 'react';
import { useChannel } from "./AblyReactEffect";
import styles from './AblyChatComponent.module.css';

const AblyChatComponent = () => {

  let inputBox = null;
  let messageEnd = null;

  const [messageText, setMessageText] = useState("");
  const [receivedMessages, setMessages] = useState([]);
  const [delay, setDelay] = useState(3);
  const [useDelay, setUseDelay] = useState(false);
  const [recurrence, setRecurrence] = useState(5);
  const [useRecurrence, setUseRecurrence] = useState(false);
  const messageTextIsEmpty = messageText.trim().length === 0;

  const [channel, ably] = useChannel("chat-demo", (message) => {
    const history = receivedMessages.slice(-199);
    setMessages([...history, message]);
  });

  const sendChatMessage = (messageText) => {
    if (useDelay) { 
      channel.scheduleMessage('chat-message', messageText, Date.now() + delay * 1000);
    } else {
      channel.publish({ name: "chat-message", data: messageText });
    }
    setMessageText("");
    inputBox.focus();
  }

  const handleFormSubmission = (event) => {
    event.preventDefault();
    sendChatMessage(messageText);
  }

  const handleDelayChange = (event) => {
    const requestedDelay = (event.target.value);
    if (requestedDelay < 3) {
      return;
    }
    setDelay(requestedDelay);
  }

  const handleRecurrenceChange = (event) => {
    const requestedRecurrence = (event.target.value);
    if (requestedRecurrence < 3) {
      return;
    }
    setRecurrence(requestedDelay);
  }

  const handleKeyPress = (event) => {
    if (event.charCode !== 13 || messageTextIsEmpty) {
      return;
    }
    sendChatMessage(messageText);
    event.preventDefault();
  }

  const messages = receivedMessages.map((message, index) => {
    const author = message.connectionId === ably.connection.id ? "me" : "other";
    return <span key={index} className={styles.message} data-author={author}>{message.data}</span>;
  });

  useEffect(() => {
    messageEnd.scrollIntoView({ behaviour: "smooth" });
  });

  return (
    <div className={styles.chatHolder}>
      <div className={styles.chatText}>
        {messages}
        <div ref={(element) => { messageEnd = element; }}></div>
      </div>
      <form onSubmit={handleFormSubmission} className={styles.form}>
        <textarea
          ref={(element) => { inputBox = element; }}
          value={messageText}
          placeholder="Type a message..."
          onChange={e => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          className={styles.textarea}
        ></textarea>
        <input type="number" disabled={!useDelay} value={delay} onChange={handleDelayChange}></input>
        <label>
          use delay
          <input type="checkbox" checked={useDelay} onChange={e => setUseDelay(!useDelay)}></input>
        </label>
        <button type="submit" className={styles.button} disabled={messageTextIsEmpty}>Send</button>
      </form>
    </div>
  )
}

export default AblyChatComponent;
