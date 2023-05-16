"use client";

import { FC, useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import "./chat.css";

export type Message = {
  id: string;
  userId: string;
  content: string;
  username: string;
  date: Date;
  notFetched?: boolean;
};

type ChatScreenProps = {
  messages: Message[];
  userId: string;
  username: string;
};

const MyMessageDisplay = ({
  content,
  date,
  notFetched,
}: {
  content: string;
  date: Date;
  notFetched: boolean;
}) => {
  const hours = date.getHours() > 9 ? date.getHours() : "0" + date.getHours();
  const minutes = date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();
  return (
    <div className="flex justify-end">
      <div className="text-white w-fit bg-emerald-500 min-w-[33%] py-3 px-4 rounded-2xl max-w-[70%] rounded-tr-none break-words">
        <div>{content}</div>
        <div className="flex justify-end text-sm">
          {hours + ":" + minutes}
        </div>
      </div>
      {notFetched ? <span className="text-red-900 px-1" title="Message not fetched">❗</span> : null}
    </div>
  );
};

const MessageDisplay = ({
  content,
  username,
  date,
}: {
  content: string;
  username: string;
  date: Date;
}) => {
  const hours = date.getHours() > 9 ? date.getHours() : "0" + date.getHours();
  const minutes = date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();
  return (
    <div className="flex flex-col">
      <strong className="text-cyan-600 break-words">{username}:</strong>
      <div className="text-white w-fit bg-cyan-500 font-medium min-w-[33%] py-3 px-4 max-w-[70%] rounded-2xl rounded-tl-none break-words">
        <div>{content}</div>
        <div className="flex justify-end text-sm">
          {hours + ":" + minutes}
        </div>
      </div>
    </div>
  );
};

const ChatScreen: FC<ChatScreenProps> = ({ userId, username, messages }) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [myMessages, setMyMessages] = useState<Message[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex justify-center items-center gap-4 flex-col max-w-[1100px] bg-gray-200 dark:bg-slate-700 w-full h-full sm:rounded-md sm:w-4/5 sm:h-4/5 shadow-2xl">
      <div className="flex flex-col gap-3 flex-1 p-3 overflow-y-auto no-scroll w-full">
        {messages.map((message) => {
          if (message.userId === userId) {
            return (
              <MyMessageDisplay
                key={message.id}
                content={message.content}
                date={new Date(message.date)}
                notFetched={!!message.notFetched}
              />
            );
          }
          return (
            <MessageDisplay
              key={message.id}
              content={message.content}
              username={message.username}
              date={new Date(message.date)}
            />
          );
        })}
        <div
          ref={messagesEndRef}
          style={{ overflowAnchor: "auto", height: "1px" }}
        ></div>
      </div>
      <form className="flex w-full p-3 bg-gray-300 sm:rounded-b-md dark:bg-slate-600">
        <input
          className="flex-1 focus:outline-none min-w-[150px] py-2 px-4 text-black rounded-md rounded-r-none"
          type="text"
          id="newMessage"
          placeholder="New message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="cursor-pointer rounded-l-none p-2 rounded-lg transition-all bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-slate-50 font-bold"
          disabled={!newMessage}
          onClick={(e) => {
            e.preventDefault();
            const messageId = nanoid();

            const message = {
              id: messageId,
              username,
              userId,
              content: newMessage,
              date: new Date(),
              notFetched: true,
            }

            setMyMessages([...myMessages, message]);

            messages.push(message);

            fetch("/api/chat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: messageId,
                username,
                userId,
                content: newMessage,
                date: new Date(),
              }),
            });
            setNewMessage("");
          }}
          type="submit"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatScreen;