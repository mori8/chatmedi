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
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  user,
  tempChatMediResponse,
  isFetching,
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
              className={classNames("rounded-full w-8 h-8", {
                "mt-8": message.sender === "ai",
              })}
              src={
                message.sender === "user" ? user?.image! : "/images/robot-1.svg"
              }
              alt={message.sender}
            />
          </div>
          <div
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
                  />
                ) : (
                  <div className="text-sm text-slate-400">
                    Analyzing <LoadingDots />
                  </div>
                )}
              </>
            )}
          </div>
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
            />
          </span>
          {isFetching && (
            <div className="mt-3">
              <BeatLoader color="#cacaca" size={8} speedMultiplier={1} />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatMessages;
