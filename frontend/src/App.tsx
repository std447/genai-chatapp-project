import React, {useEffect,useState,useRef} from "react";
import type { ChatRequest, ChatErrorResponse, ChatSuccessResponse } from "@shared-types/index";
const route = "chat"
const apiUrl = new URL(route,import.meta.env.VITE_API_BASE_URL);

interface ChatMessage {
  id:string; //Unique Id
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}
function App() {
  const [messages,setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage,setInputMessage] = useState<string>('');
  const [isLoading,setIsLoding] = useState<boolean>(false);
  const [error,setError] = useState<string|null>(null);
  const [userFingerprint,setUserFingerprint] = useState<string|null>(null);

  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    let fingerprint = localStorage.getItem('userFingerprint');
    if(!fingerprint){
      fingerprint = crypto.randomUUID();
      localStorage.setItem('userFingerprint',fingerprint)
      }
    setUserFingerprint(fingerprint);
  },[])



  useEffect(() => {
    messageEndRef.current?.scrollIntoView({behavior:"smooth"})
  },[messages]);

  const handleSendMessage = async (e:React.FormEvent) => {
    e.preventDefault();
    if(!inputMessage.trim() || isLoading || !userFingerprint) return;
    const newMessage:ChatMessage = {
      id:crypto.randomUUID(),
      role: "user",
      content:inputMessage,
      timestamp:Date.now(),
    }
    setMessages((prevMessages) => [...prevMessages,newMessage]);
    setInputMessage("");
    setIsLoding(true);
    setError(null);

    try {
      const chatRequest:ChatRequest = {
        message:inputMessage,
        fingerprint:userFingerprint
      };
      const backendUrl = apiUrl.href;
      const response = await fetch(backendUrl,{
        method:"POST",
        headers:{
          'Content-Type': 'application/json',
        },
        body:JSON.stringify(chatRequest),
      });

      if(!response.ok){
        const errorData:ChatErrorResponse = await response.json();
        throw new Error(errorData.error || "Unknown Error occured")
      }

      const successData:ChatSuccessResponse = await response.json();
      const aiResponse:ChatMessage = {
        id:crypto.randomUUID(),
        role:"ai",
        content:successData.response,
        timestamp:Date.now()
      };
      
      setMessages((prevMessages)=>[...prevMessages,aiResponse])
      
    } catch (error:any) {
      console.error('Error sending message:',error)
      setError(error.message || "Failed to get response from AI.")
    } finally{
      setIsLoding(false);
    }
  };

  return(
    
      <div data-theme="dark" className="min-h-screen flex flex-col justify-center bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 ease-in-out antialiased">
        <header className="text-center px-4 py-4">
          <h1 className="text-2xl/tight xl:text-5xl font-bold">Welcome to GenAI ChatApp!</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full pb-20">
        {messages.length === 0 && !isLoading && !error && (
          <p className="text-center relative top-10/12">Start by typing a message below!</p>
        )}
        {
          messages.map(msg => (
            <div
             key={msg.id}
             className={`flex ${msg.role === 'ai' ? "justify-start" : "justify-end"}`}
             >
              <div
              className={`max-w-3/4 p-3 bg-inherit/20 dark:bg-inherit/80 dark:shadow-current/20 rounded-lg shadow-sm ${
                msg.role === 'user'
                  ? 'rounded-br-none'
                  : 'rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs text-right opacity-75 dark:opacity-100 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
              
            </div>
          ))
        }

        {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-3/4 p-3 bg-inherit/20 dark:bg-inherit/80 dark:shadow-current/20 rounded-lg rounded-bl-none shadow-sm">
                <span className="animate-pulse ">Typing ...</span>
              </div>
            </div>
          )
        }
         {error && (
            <div className="flex justify-center">
              <div className="max-w-3/4 p-3 text-red-400 bg-red-100 dark:text-red-200 dark:bg-red-950 dark:shadow-current/20 rounded-lg rounded-bl-none shadow-sm">
                Error: {error}
              </div>
            </div>
          )
        }
        <div ref={messageEndRef}></div>
      </main>
      <footer className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 max-h-20 p-3 shadow-lg border-t border-gray-200 z-10">
        <form onSubmit={handleSendMessage} method="POST" className="flex max-w-2xl mx-auto w-full gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
        {userFingerprint && (
          <div className="text-center text-xs text-gray-500 dark:text-gray-200 mt-1 max-sm:hidden">
            Your anonymous ID: {userFingerprint.substring(0, 8)}...
          </div>
        )}
      </footer>
      
      </div>
    
  )
}

export default App;