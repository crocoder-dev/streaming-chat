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
import Picker, { EmojiClickData } from "emoji-picker-react";
import "./chat.css";
import { MouseDownEvent } from "emoji-picker-react/dist/config/config";
import { FaceSmileIcon } from "@heroicons/react/20/solid";

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
  console.log("abort");
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
  const hours =
    newDate.getHours() > 9 ? newDate.getHours() : "0" + newDate.getHours();
  const minutes =
    newDate.getMinutes() > 9
      ? newDate.getMinutes()
      : "0" + newDate.getMinutes();

  return (
    <div className="flex w-full mt-2 space-x-3 max-w-[70%] ml-auto justify-end">
      <div className="flex flex-col gap-1">
        <div className="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg">
          {content}
        </div>
        <div className="text-xs text-gray-500 leading-none">
          {hours + ":" + minutes}
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
      <div className="flex justify-center items-center flex-shrink-0 h-10 w-10 rounded-full bg-gray-300">
        <strong>ME</strong>
      </div>
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
    <div className="flex w-full mt-2 space-x-3 max-w-[70%]">
      <div className="flex justify-center items-center flex-shrink-0 h-10 w-10 rounded-full bg-gray-300">
        <strong>{username.slice(-2).toUpperCase()}</strong>
      </div>
      <div className="flex flex-col gap-1">
        {/* <strong className="text-cyan-600 break-words">{username}:</strong> */}
        <div className="bg-gray-300 p-3 rounded-r-lg rounded-bl-lg">
          {content}
        </div>
        <div className="text-xs text-gray-500 leading-none">
          {hours + ":" + minutes}
        </div>
      </div>
    </div>
  );
};

const ChatScreen: FC<ChatScreenProps> = ({ userId, username, messages }) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [notFetchedMessages, setNotFetchedMessages] = useState<string[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const onEmojiClick: MouseDownEvent = (event: EmojiClickData) => {
    const textAreaElement = document.getElementById(
      "message"
    ) as HTMLTextAreaElement;
    const selectionStart = textAreaElement.selectionStart;
    const selectionEnd = textAreaElement.selectionEnd;

    setNewMessage(
      newMessage.substring(0, selectionStart) +
        event.emoji +
        newMessage.substring(selectionEnd)
    );
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col flex-grow w-full max-w-xl bg-white shadow-xl rounded-lg overflow-hidden h-full sm:rounded-md sm:w-4/5 sm:h-4/5">
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
      <div className="flex items-start space-x-4">
        <div className="min-w-0 flex-1">
          <form action="#" className="relative">
            <div className="overflow-hidden rounded-lg shadow-sm focus:ring-0 border-1 ring-1 ring-slate-300 m-1">
              <label htmlFor="comment" className="sr-only">
                Add your comment
              </label>
              <textarea
                rows={3}
                name="message"
                id="message"
                className="block w-full resize-none bg-transparent text-gray-900 p-1 placeholder:text-gray-400 focus:outline-none sm:text-sm sm:leading-6"
                placeholder="Your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
            </div>
            <div className="bottom-0 flex justify-between py-2 pl-3 pr-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log('render')
                  setEmojiPickerOpen(!emojiPickerOpen);
                }}
              >
                <FaceSmileIcon
                  className="h-7 w-7 flex-shrink-0 text-gray-400"
                  aria-hidden="true"
                />
              </button>
              <input
                type="submit"
                value="Post"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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

                  sendMessage(
                    message,
                    notFetchedMessages,
                    setNotFetchedMessages
                  );

                  setNewMessage("");
                }}
              />
            </div>
            <Picker
              onEmojiClick={onEmojiClick}
              open={emojiPickerOpen}
              skinTonesDisabled={true}
              previewConfig={{showPreview: false}}
              lazyLoadEmojis={false}
              width={"100%"}
              height={300}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

const StartingScreen: FC<StartingScreenProps> = ({ confirmUsername }) => {
  const [username, setUsername] = useState<string>("");

  return (
    <div className="w-80 h-52">
      <form className="flex justify-center items-center gap-4 flex-col p-6 bg-white w-full h-full rounded-xl shadow-2xl">
        <input
          className="py-2 px-4 focus:outline-none bg-slate-200 text-black rounded-md"
          type="text"
          id="username"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          className="p-2 rounded-lg transition-all bg-blue-600 hover:bg-blue-500 px-4 py-2 text-slate-50 font-bold"
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
      <div className="flex justify-center items-center text-xl font-bold bg-gray-100 text-gray-800 p-10 w-screen h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100 text-gray-800 p-10">
      {!userId ? (
        <StartingScreen confirmUsername={confirmUsername} />
      ) : (
        <ChatScreen userId={userId} username={username} messages={messages} />
      )}
    </div>
  );
};

export default Chat;
