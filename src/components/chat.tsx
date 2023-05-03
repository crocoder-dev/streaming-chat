"use client";

import { FC, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import "./chat.css";

type Message = {
  id: string;
  userId: string;
  content: string;
  username: string;
};

type StartingScreenProps = {
  confirmUsername: (username: string) => void;
};

const StartingScreen: FC<StartingScreenProps> = ({ confirmUsername }) => {
  const [username, setUsername] = useState<string>("");

  return (
    <form>
      <label htmlFor="username">Username</label>
      <input
        type="text"
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)} />
      <button
        onClick={(e) => {
          confirmUsername(username)
          e.preventDefault();
        }}
        type="submit">Start Chatting
      </button>
    </form>
  );
};

type ChatScreenProps = {
  messages: Message[];
  userId: string;
  username: string;
};

const MyMessageDisplay = ({ content }: { content: string }) => {
  return (
    <div className="flex justify-end">
      <div className="text-white bg-blue-800 min-w-[33%] m-w-[66%] mx-4 my-2 p-2 rounded-lg break-normal">
        {content}
      </div>
    </div>
  );
};

const MessageDisplay = ({ content, username }: { content: string, username: string }) => {
  return (
    <div className="flex">
      <div className="text-white bg-gray-900 min-w-[33%] max-w-[66%] mx-4 my-2 p-2 rounded-lg break-words">
        <strong>{username}</strong>: {content}
      </div>
    </div>
  );
};



const ChatScreen: FC<ChatScreenProps> = ({ userId, username, messages }) => {

  const [newMessage, setNewMessage] = useState<string>("");
  return (
    <>
      <div className="h-5/6 overflow-y-auto no-scroll">
        {messages.map((message) => {
          if (message.userId === userId) {
            return <MyMessageDisplay key={message.id} content={message.content} />
          }
          return <MessageDisplay key={message.id} content={message.content} username={message.username} />
        })}
        <div style={{ overflowAnchor: "auto", height: "1px" }}></div>
      </div>
      <form>
        <label htmlFor="newMessage">New Message</label>
        <input
          type="text"
          id="newMessage"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)} />
        <button
          disabled={!newMessage}
          onClick={(e) => {
            e.preventDefault();
            fetch("/api/chat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: nanoid(),
                username,
                userId,
                content: newMessage,
              }),
            });
            setNewMessage("");
          }}
          type="submit">
          Send
        </button>
      </form>
    </>
  );
};

const Chat = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const confirmUsername = async (username: string) => {
    setUsername(username);
    const userId = nanoid();
    setUserId(userId);
    localStorage.setItem("username", username);
    localStorage.setItem("userId", userId);
  };

  useEffect(() => {
    const eventSource = new EventSource("/api/chat");
    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data) as Message;
      setMessages((messages) => [...messages, message]);
    };
    setUsername(localStorage.getItem("username") || "");
    setUserId(localStorage.getItem("userId") || null);
    setLoading(false);
    return () => {
      eventSource.close();
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-[512px] h-screen">
      {
        !userId
          ? <StartingScreen confirmUsername={confirmUsername} />
          : <ChatScreen userId={userId} username={username} messages={messages} />
      }
    </div>
  )
};

export default Chat;
