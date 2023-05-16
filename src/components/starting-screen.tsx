"use client";

import { FC, useState } from "react";

type StartingScreenProps = {
  confirmUsername: (username: string) => void;
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

export default StartingScreen;
