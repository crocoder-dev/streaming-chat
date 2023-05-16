"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import "./chat.css";
import StartingScreen from "./starting-screen";
import ChatScreen, { Message } from "./chat-screen";


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
    
    eventSource.addEventListener("chat.message", (event) => {
      const message = JSON.parse(event.data) as Message;
      setMessages((messages) => [...messages.filter(e => e.id !== message.id), message]);
    });

    setUsername(localStorage.getItem("username") || "");
    setUserId(localStorage.getItem("userId") || null);
    setLoading(false);

    return () => {
      eventSource.close();
    };
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center text-xl text-white font-bold bg-cyan-700 dark:bg-slate-900 w-screen h-screen">Loading...</div>;
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-cyan-700 dark:bg-slate-900">
      {!userId ? (
        <StartingScreen confirmUsername={confirmUsername} />
      ) : (
        <ChatScreen userId={userId} username={username} messages={messages} />
      )}
    </div>
  );
};

export default Chat;
