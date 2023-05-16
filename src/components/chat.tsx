"use client";

import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { nanoid } from "nanoid";
import "./chat.css";

type StartingScreenProps = {
  confirmUsername: (username: string) => void;
};

export type Message = {
  id: string;
  userId: string;
  content: string;
  username: string;
  date: Date;
};

type ChatScreenProps = {
  messages: Message[];
  userId: string;
  username: string;
};

const sendMessage = (
  message: Message,
  notFetchedMessages: string[],
  setNotFetchedMessages: Dispatch<SetStateAction<string[]>>
) => {
  try {
    fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    }).then((res) => {
      if (res.status != 200) {
        setNotFetchedMessages([...notFetchedMessages, message.id]);
      } else {
        setNotFetchedMessages(
          notFetchedMessages.filter((e) => e !== message.id)
        );
      }
    });
  } catch (err) {
    setNotFetchedMessages([...notFetchedMessages, message.id]);
  }
};

const MyMessageDisplay = ({
  message,
  notFetchedMessages,
  setNotFetchedMessages,
}: {
  message: Message;
  notFetchedMessages: string[];
  setNotFetchedMessages: Dispatch<SetStateAction<string[]>>;
}) => {
  const { date, content, id } = message;

  const newDate = new Date(date);
  const hours = newDate.getHours() > 9 ? newDate.getHours() : "0" + newDate.getHours();
  const minutes =newDate.getMinutes() > 9 ? newDate.getMinutes() : "0" + newDate.getMinutes();

  return (
    <div className="flex flex-col items-end">
      <div className="text-white w-fit bg-emerald-500 min-w-[33%] py-3 px-4 rounded-2xl max-w-[70%] rounded-tr-none break-words">
        <div>{content}</div>
        <div className="flex justify-end text-sm">{hours + ":" + minutes}</div>
      </div>
      {notFetchedMessages.includes(id) ? (
        <span className="text-red-500 p-1">
          Message not sent❗
          <span
            className="underline text-blue-400 hover:text-blue-300 cursor-pointer"
            onClick={() =>
              sendMessage(message, notFetchedMessages, setNotFetchedMessages)
            }
          >
            resend
          </span>
        </span>
      ) : null}
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
  const minutes =
    date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();
  return (
    <div className="flex flex-col">
      <strong className="text-cyan-600 break-words">{username}:</strong>
      <div className="text-white w-fit bg-cyan-500 font-medium min-w-[33%] py-3 px-4 max-w-[70%] rounded-2xl rounded-tl-none break-words">
        <div>{content}</div>
        <div className="flex justify-end text-sm">{hours + ":" + minutes}</div>
      </div>
    </div>
  );
};

const ChatScreen: FC<ChatScreenProps> = ({ userId, username, messages }) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [notFetchedMessages, setNotFetchedMessages] = useState<string[]>([]);

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
                message={message}
                notFetchedMessages={notFetchedMessages}
                setNotFetchedMessages={setNotFetchedMessages}
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
            };

            messages.push(message);

            sendMessage(message, notFetchedMessages, setNotFetchedMessages);

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

const StartingScreen: FC<StartingScreenProps> = ({ confirmUsername }) => {
  const [username, setUsername] = useState<string>("");

  return (
    <div className="w-80 h-52">
      <form className="flex justify-center items-center gap-4 flex-col p-6 bg-gray-200 dark:bg-slate-700 w-full h-full rounded-xl shadow-2xl">
        <input
          className="py-2 px-4 focus:outline-none text-black rounded-md"
          type="text"
          id="username"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          className="p-2 rounded-lg transition-all bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-slate-50 font-bold"
          onClick={(e) => {
            confirmUsername(username);
            e.preventDefault();
          }}
          type="submit"
        >
          Start Chatting
        </button>
      </form>
    </div>
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

    eventSource.addEventListener("chat.message", (event) => {
      const message = JSON.parse(event.data) as Message;
      setMessages((messages) => [
        ...messages.filter((e) => e.id !== message.id),
        message,
      ]);
    });

    setUsername(localStorage.getItem("username") || "");
    setUserId(localStorage.getItem("userId") || null);
    setLoading(false);

    return () => {
      eventSource.close();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center text-xl text-white font-bold bg-cyan-700 dark:bg-slate-900 w-screen h-screen">
        Loading...
      </div>
    );
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
