import React, { useEffect, useRef, useState } from "react";
import { Gemini } from "../Gemini";
import { FaCopy } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

function App() {
  const chatContainerRef = useRef(null);

  // Initialize chats from localStorage or use an empty array
  const [chats, setChats] = useState(() => {
    const storedChats = localStorage.getItem("chats");
    return storedChats ? JSON.parse(storedChats) : [];
  });

  const [loading, setLoading] = useState(false);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser && storedUser._id){
      scrollToBottom();
      console.log("User looged in so saving to db directly");
    }else{
      localStorage.setItem("chats", JSON.stringify(chats));

    }
  }, [chats]);

 

  useEffect(() => {
    const fetchUserChats = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (storedUser && storedUser._id) {
        setLoading(true); 
        try {
          const response = await axios.get(
            `https://sameetai-backend.onrender.com/api/chats/${storedUser._id}`
          );
        
          if (Array.isArray(response.data.chats)) {
            setChats(response.data.chats);
            scrollToBottom();
          } else {
            console.error("Chats data is not an array:", response.data.chats);
            setChats([]); // Set an empty array if the data is not as expected
          }
        } catch (error) {
          console.error("Error fetching user chats:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("User ID is not available.");
      }
    };

    fetchUserChats();
  }, []); 


  const saveUserChats = async (answer, question) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser && storedUser._id) {
      setLoading(true); 
      try {
        const response = await axios.post(
          `https://sameetai-backend.onrender.com/api/chat`,
          {
            userId: storedUser._id,
            question: question,
            answer: answer,
          }
        );
       scrollToBottom(); // Merging chats
      } catch (error) {
        console.error("Error saving user chats:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("User ID is not available.");
    }
  };

  const handleChat = (newQuestion) => {
    if (!newQuestion.trim()) {
      toast("Please enter a prompt to generate text.");
      return;
    }
    setLoading(true);

    const newChat = {
      id: chats.length + 1, // Generate a unique ID for each chat
      question: newQuestion,
      answer: "AI is thinking...",
    };

    setChats((prevChats) => [...prevChats, newChat]);

    setTimeout(async () => {
      try {
        const serializedChats = chats
          .map((chat) => `You: ${chat.question} | AI: ${chat.answer}`)
          .join("\n");
          const question = `User's question: ${newQuestion}\n
          Our Previous Chats:
          ${serializedChats}\n
          Only use previous chats if you feel the user's question has any reference, connection, or is related to the now-asked question. Also don't let user know you have been told you see previous chats`;
          
        const aiResponse = await Gemini(question);
        typingEffect(newChat.id, formatAnswer(aiResponse));
      
        saveUserChats(aiResponse, newQuestion);
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching AI response:", error);
      } finally {
        setLoading(false);
      }
    }, 100);
  };


  const typingEffect = (id, responseText) => {
    let index = 0;
    const interval = setInterval(() => {
      setChats((prevChats) => {
        const updatedChats = [...prevChats];
        updatedChats[updatedChats.length - 1].answer = responseText.slice(0, index);
        return updatedChats;
      });
      index += 1;
      if (index > responseText.length) {
        clearInterval(interval);
      }
    }, 12);
  };
  const formatAnswer = (response) => {
    const boldFormatted = response.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    const lineBreakFormatted = boldFormatted.replace(/\*/g, "<br />");
    return lineBreakFormatted;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success("Copied to clipboard!"),
      (err) => toast.error("Error copying text: " + err)
    );
  };
 // Function to scroll to the bottom
 const scrollToBottom = () => {
  if (chatContainerRef.current) {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }
};
  useEffect(() => {
    scrollToBottom();
    setTimeout(() => {
      scrollToBottom();
    }, 1000);
    
  }, [chats]);

  return (
    <>
      <div
        ref={chatContainerRef}
        className="max-w-screen-lg m-auto mt-24 max-h-screen overflow-y-auto pb-20"
      >
        {Array.isArray(chats) && chats.map((chat) => (
          <div key={chat.id}>
            <div className="chat chat-end">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <img alt="User avatar" src="https://res.cloudinary.com/drp3ojnl0/image/upload/v1737392823/user_bbodxb.jpg" />
                </div>
              </div>
              <div className="chat-header">
                <b>You</b>
              </div>
              <div className="chat-bubble">{chat.question}</div>
            </div>

            <div className="chat chat-start">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <img alt="AI avatar" src="https://res.cloudinary.com/drp3ojnl0/image/upload/v1737392823/logo_t5hvol.webp" />
                </div>
              </div>
              <div className="chat-header">
                <b>Sameet~Ai</b>
              </div>
              <div className="chat-bubble">
                <p dangerouslySetInnerHTML={{ __html: chat.answer }}></p>
                <div
                  className="flex justify-end cursor-pointer"
                  onClick={() => copyToClipboard(chat.answer)}
                >
                  <FaCopy />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="fixed bottom-0 left-0 w-full bg-base-100 shadow-md px-4 py-3">
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <form
                className="flex items-center space-x-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const message = e.target.elements.message.value;
                  handleChat(message);
                  e.target.reset();
                }}
              >
                <input
                  name="message"
                  type="text"
                  placeholder="Type your message..."
                  className="input input-bordered w-full rounded-full px-4"
                />
                <button
                  type="submit"
                  className="btn btn-neutral rounded-full px-12"
                >
                  {loading ? (
                    <span className="loading loading-dots loading-md"></span>
                  ) : (
                    "Send"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default App;





















// woring if porbmein above use this 




// import React, { useEffect, useRef, useState } from "react";
// import { Gemini } from "../Gemini";
// import { FaCopy } from "react-icons/fa";
// import { ToastContainer, toast } from 'react-toastify';

// function App() {
//   const chatContainerRef = useRef(null);

//   // Initialize chats as an empty array
//   const [chats, setChats] = useState([]);
//   const [loading,setLoading]=useState(0);

//   // Function to scroll to the bottom
//   const scrollToBottom = () => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//     }
//   };

//   // UseEffect to scroll when the component mounts or when chats change
//   useEffect(() => {
//     scrollToBottom();
//   }, [chats]);

//   // Function to simulate AI response typing effect
//   const typingEffect = (id, responseText) => {
//     let index = 0;
//     const interval = setInterval(() => {
//       setChats((prevChats) => {
//         const updatedChats = [...prevChats];
//         updatedChats[updatedChats.length - 1].answer = responseText.slice(0, index);
//         return updatedChats;
//       });
//       index += 1;
//       if (index > responseText.length) {
//         clearInterval(interval);
//       }
//     }, 12); // Adjust typing speed by changing the interval (in milliseconds)
//   };

//   // Handle chat function to add new messages to the chat
//   const handleChat = (newQuestion) => {
//     setLoading(true); // Set loading to true when chat starts
  
//     const newChat = {
//       id: chats.length + 1, // Incremental id
//       question: newQuestion,
//       answer: "AI is thinking...", // Initial AI thinking message
//     };
  
//     setChats((prevChats) => [...prevChats, newChat]);
  
//     // Simulate AI response after a short delay
//     setTimeout(async () => {
//       try {
//         const aiResponse = await Gemini(newQuestion); // Simulate AI response
//         console.log(aiResponse);
//         typingEffect(newChat.id, aiResponse); // Start typing animation
//       } catch (error) {
//         console.error("Error fetching AI response:", error);
//       } finally {
//         setLoading(false); // Set loading to false after AI response is processed
//       }
//     }, 100); // Simulate a 2-second delay before starting the typing animation
//   };
      

//   // Function to copy text to clipboard
//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text).then(
//       () => {
//         toast.success("Copied to clipboard!");
        
//       },
//       (err) => {
//         console.error("Error copying text: ", err);
//         toast.error("Error copying text: ", err);

//       }
//     );
//   };

//   return (
//     <>
//       <div
//         ref={chatContainerRef}
//         className="max-w-screen-lg m-auto mt-24 max-h-screen overflow-y-auto pb-20"
//       >
//         {chats.map((chat) => (
//           <div key={chat.id}>
//             <div className="chat chat-end">
//               <div className="chat-image avatar">
//                 <div className="w-10 rounded-full">
//                   <img
//                     alt="Tailwind CSS chat bubble component"
//                     src="/src/assets/user.jpg"
//                   />
//                 </div>
//               </div>  
//               <div className="chat-header">
//                 <b>You</b>
//                 <time className="text-xs opacity-50"></time>
//               </div>
//               <div className="chat-bubble">{chat.question}</div>
//             </div>

//             <div className="chat chat-start">
//               <div className="chat-image avatar">
//                 <div className="w-10 rounded-full">
//                   <img
//                     alt="Tailwind CSS chat bubble component"
//                     src="/src/assets/logo.webp"
//                   />
//                 </div>
//               </div>
//               <div className="chat-header">
//                 <b>Sameet~Ai</b>
//                 <time className="text-xs opacity-50"></time>
//               </div>
//               <div className="chat-bubble">
//                <p> {chat.answer} </p>
//                 <br /> 
//                 <div 
//                   className="flex justify-end cursor-pointer" 
//                   onClick={() => copyToClipboard(chat.answer)}
//                 >
//                   <FaCopy />
//                 </div> 
//               </div>
//             </div>
//           </div>
//         ))}

//         {/* Footer */}
//         <div className="fixed bottom-0 left-0 w-full bg-base-100 shadow-md px-4 py-3">
//           <div className="flex justify-center">
//             <div className="w-full max-w-2xl">
//               <form
//                 className="flex items-center space-x-2"
//                 onSubmit={(e) => {
//                   e.preventDefault();
//                   const message = e.target.elements.message.value;
//                   handleChat(message);
//                   e.target.reset();
//                 }}
//               >
//                 <input
//                   name="message"
//                   type="text"
//                   placeholder="Type your message..."
//                   className="input input-bordered w-full rounded-full px-4"
//                 />
//                 <button
//                   type="submit"
//                   className="btn btn-neutral rounded-full px-12"
//                 >{loading ? ( <span className="loading loading-dots loading-md"></span>):("Send")}
                  
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//       <ToastContainer />
//     </>
//   );
// }

// export default App;
