import React, { useEffect, useRef, useState } from "react";
import "./Chat.sass";
import { IMessage } from "../../types/MessageType";
import { io } from "socket.io-client";

const Chat = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [message, setMessage] = useState<string>("");
  const socket: any = useRef();
  const [connected, setConnected] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const chat: any = useRef(null);
  const nameInput: any = useRef(null);
  const messageInput: any = useRef(null);

  async function sendMessage() {
    const messageInfo = {
      username: username,
      message,
      id: Date.now(),
      event: "message",
    };

    if(message.trim().length > 0) {
      socket.current.emit("sendMessage", messageInfo);
    }

    setMessage("");
    setTimeout(() => {
      chat.current.scroll(0, chat.current.scrollHeight - chat.current.clientHeight);
    }, 10);
  }

  function connect() {
    socket.current = io("https://real-time-chat-server-666.herokuapp.com/");

    socket.current.on("connect", () => {
      setConnected(true);
      socket.current.emit('join', username);
      socket.current.on("joinUser", (message: IMessage) => {
        setMessages((prev) => [...prev, message]);
      });

      socket.current.on("message", (message: IMessage) => {
        setMessages((prev) => [...prev, message]);
        setTimeout(() => {
          chat.current.scroll(0, chat.current.scrollHeight - chat.current.clientHeight);
        }, 10);
      });

      messageInput.current.focus();
    });

    socket.current.on("disconnect", () => {
      console.log('disconnected');
    });
  }

  useEffect(() => {
    nameInput.current.focus();
  }, []);

  return (
    <>
      <div className="chat">
        {messages.length ? (
          <ul className="chat__messages" ref={chat}>
            {messages.map((message) => {
              return (
                <li key={message.id} className="chat__messages-item">
                  {message.event === "connection" ? (
                    <span>{message.username} присоединился(-ась)</span>
                  ) : (
                    <span>
                      {message.username}: {message.message}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <h3 className="center">Сообщений пока нет</h3>
        )}
        <div className="chat__form">
          <div className="chat__form-item">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value !== "") {
                  sendMessage();
                }
              }}
              ref={messageInput}
              type="text"
              placeholder="Напиши сообщение..."
              className="chat__form-input"
            />
          </div>
          <button onClick={sendMessage} className="chat__form-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="#fff"
            >
              <path d="M24 0l-6 22-8.129-7.239 7.802-8.234-10.458 7.227-7.215-1.754 24-12zm-15 16.668v7.332l3.258-4.431-3.258-2.901z" />
            </svg>
          </button>
        </div>
      </div>
      {!connected && (
        <div className="modal">
          <div className="modal__inner">
            <h2 className="modal__title center">Введите свое имя</h2>
            <div className="modal__form">
              <input
                value={username}
                placeholder="Введи свое имя"
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value !== "") {
                    connect();
                  }
                }}
                type="text"
                className="modal__form-input"
                ref={nameInput}
              />
              <button onClick={connect} className="modal__form-btn">
                Войти
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
