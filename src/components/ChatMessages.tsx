import React from "react";
import classNames from "classnames";
import LoadingDots from "@/components/LoadingDots";
import MarkdownWrapper from "@/components/MarkdownWrapper";
import ChatResponse from "@/components/ChatResponse";
import BeatLoader from "react-spinners/BeatLoader";
import { isUserMessage } from "@/utils/utils";

interface ChatMessagesProps {
  messages: Message[];
  user:
    | {
        email?: string | null | undefined;
        image?: string | null | undefined;
      }
    | undefined;
  tempChatMediResponse: ChatMediResponse | null;
  isFetching: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  user,
  tempChatMediResponse,
  isFetching,
  setIsModalOpen,
}) => {
  return (
    <>
      {messages.map((message, index) => (
        <div
          key={index}
          className={classNames("flex gap-4 justify-start", {
            "flex-row-reverse": message.sender === "user",
          })}
        >
          <div className="profile-image flex-shrink-0">
            <img
              className="rounded-full w-8 h-8"
              src={
                message.sender === "user" ? user?.image! : "/images/robot-1.svg"
              }
              alt={message.sender}
            />
          </div>
          <span
            className={classNames("prose", {
              "bg-slate-100 rounded-xl px-4 py-2": message.sender === "user",
            })}
          >
            {isUserMessage(message) ? (
              <>
                {message.prompt.files && message.prompt.files.length > 0 && (
                  <img
                    src={message.prompt.files[0]}
                    alt="Prompt image"
                    className="w-64 mt-2 rounded"
                  />
                )}
                <MarkdownWrapper markdown={message.prompt.text} />
              </>
            ) : (
              <>
                {message.response ? (
                  <ChatResponse
                    response={message.response}
                    setIsModalOpen={setIsModalOpen}
                  />
                ) : (
                  <div className="text-sm text-slate-400">
                    Analyzing <LoadingDots />
                  </div>
                )}
              </>
            )}
          </span>
        </div>
      ))}
      {isFetching && tempChatMediResponse && (
        <div className="flex gap-4 justify-start">
          <div className="profile-image flex-shrink-0">
            <img
              className="rounded-full w-8 h-8"
              src="/images/robot-1.svg"
              alt="AI"
            />
          </div>
          <span className="prose">
            <ChatResponse
              response={tempChatMediResponse}
              setIsModalOpen={setIsModalOpen}
            />
          </span>
          {isFetching && (
            <div className="mt-2">
              <BeatLoader color="#cacaca" size={8} speedMultiplier={1} />
            </div>
          )}
        </div>
      )}
      
    </>
  );
};

export default ChatMessages;
