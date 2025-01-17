import React, { useState, useEffect, useRef } from 'react';
//import { socket } from "../context / socket";
import { useSocket } from "../context/socket";
import { useUser, useUserUpdate } from '.././context/user';

const Chat = () => {
    const [socket] = useSocket();
    //const [roomId, setRoomId] = useState("");
    // Messages States
    const [message, setMessage] = useState("");
    const [round, setRound] = useState(1);
    const [messageReceived, setMessageReceived] = useState([]);
    const playerUsername = sessionStorage.getItem('name');
    //const roomId = sessionStorage.getItem('id');
    const bottomRef = useRef(null);
    const user = useUser();
    const [roomId, setRoomId] = useState(user.gameId);

    useEffect(() => {
        setRoomId(user.gameId);
        console.log('useEffectRoomId: ' + user.gameId);
    }, [user.gameId]);


    const sendMessage = (e) => {
        e.preventDefault();
        console.log('sendMessage: ' + roomId);
        socket.emit("message", { message, roomId, playerUsername });
        setMessage('');
    };

    socket.on('closeGuess', (data) => {
        console.log('closeGuess');
        setMessageReceived([...messageReceived, { playerUsername: "PopCorn", message: "Pas loin !" }]);
    });

    // useEffect(() => {
    //     socket.on('startPicass', async (data) => {
    //         navigate("/picass", { state: playersList });
    //         console.log('startCountdownYOOO')
    //     })
    //     return () => {
    //         socket.off("startPicass");
    //     };
    // }, []);

    // socket.on('correctGuess', async (data) => {
    //     console.log('correctGuess');
    //     let message = data.message;
    //     setMessageReceived([...messageReceived, { playerUsername: "PopCorn", message }]);
    // });

    useEffect(() => {
        const correctGuess = async (data) => {
            console.log('correctGuess');
            let message = data.message;
            setMessageReceived([...messageReceived, { playerUsername: "PopCorn", message }]);
        }

        socket.on('correctGuess', correctGuess);

        return () => {
            socket.off("correctGuess", correctGuess);
        };
    }, [socket]);


    useEffect(() => {
        const lastWord = ({ word }) => {
            console.log('lastWord');
            setMessageReceived([{ playerUsername: "PopCorn", message: `L'expression c'était "${word}", si t'as pas trouvé ratio` }]);
        }

        socket.on('lastWord', lastWord);

        return () => {
            socket.off("lastWord", lastWord);
        };
    }, [socket]);


    // socket.on('lastWord', ({ word }) => {
    //     console.log('lastWord');
    //     setMessageReceived([{ playerUsername: "PopCorn", message: `L'expression c'était "${word}", si t'as pas trouvé ratio` }]);
    // });


    socket.on("message", (data) => {
        if (!data.correctGuess && data.playerUsername) {
            setMessageReceived([...messageReceived, { playerUsername: data.playerUsername, message: data.message }]);
        }
    });

    socket.on('startTimer', () => {
        setMessageReceived([{ playerUsername: "PopCorn", message: `Nouveau tour du round ${round} !!` }])
    })

    socket.on('round', ({ round }) => {
        setRound(round);
        setMessageReceived([{ playerUsername: "PopCorn", message: `Début du round ${round} !` }])
    })

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messageReceived]);


    return (
        <div className='flex flex-col md:m-4 md:w-1/3 w-full p-8 md:p-0 md:h-auto h-full overflow-y-auto'>
            <div className='flex flex-col h-full'>
                <h2 className='text-red-500 rounded-lg  text-center pb-4 border-red-400 border-b-2 mb-4 text-xl font-semibold md:block hidden md:m-2'>CHAT</h2>
                <ul className='overflow-y-auto scrollbar grow'>


                    {messageReceived.map((messageReceived) =>
                        (messageReceived.playerUsername === playerUsername) ?
                            <li className='flex justify-end mr-2'>
                                <p className='w-5/6 mb-1 px-4 py-2 rounded-lg inline-block rounded-br-none bg-red-400 text-white text-right break-words	'><strong>{messageReceived.playerUsername} : </strong>{messageReceived.message}</p>
                            </li>
                            :
                            (messageReceived.playerUsername === "PopCorn") ?
                                <li className='flex justify-end mr-2'>
                                    <p className='w-5/6 mb-1 px-4 py-2 rounded-lg inline-block rounded-br-none border-solid border-2 text-white text-right break-words	'><strong>{messageReceived.playerUsername} : </strong>{messageReceived.message}</p>
                                </li>
                                :
                                <li className='flex justify-start  mr-2'>
                                    <p className='w-5/6 mb-1 px-4 py-2 rounded-lg inline-block bg-gray-300 text-gray-600 break-words	'><strong>{messageReceived.playerUsername} : </strong>{messageReceived.message}</p>
                                </li>
                    )}
                    <div ref={bottomRef} />
                </ul>
                <form onSubmit={sendMessage} className='mt-6 p-2'>
                    <input
                        placeholder="Message..."
                        onChange={(event) => {
                            setMessage(event.target.value);
                        }}
                        value={message}
                        className="rounded-full pl-2 w-full"
                    />
                    <button type='submit' className='mt-4 md:w-auto w-full border-2 py-2 px-4 text-white border-white hover:bg-red-500 hover:border-transparent transition'>ENVOYER</button>
                </form>
            </div>

        </div>
    );
};

export default Chat;