import React, { useEffect, useState, useRef } from "react";
//import { useCanvas } from "../context/CanvasContext";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Header from "../Components/Header";
// import { socket } from "../context/socket";
import { useSocket } from "../context/socket";

import Chat from "../Components/Chat";
import PlayerList from "../Components/PlayerList";
import ClearCanvasButton from "../Components/ClearCanvasButton";
import Canva from "../Components/Canva";
import Timer from "../Components/Timer";
import Paricules from "../Components/Paricules";
import ResultsGameOverlay from "../Components/ResultsGameOverlay";
import BackButton from "../Components/BackButton";
import SoundButton from '.././Components/SoundButton';
import { useSoundOn } from '.././context/SoundContext';

export function Canvas() {
    const socket = useSocket();
    const { state } = useLocation();
    const [playersList, setPlayersList] = useState(state);
    const [playersListUpdatedScore, setPlayersListUpdatedScore] = useState();
    const [time, setTime] = useState(0);
    const [endTime, setEndTime] = useState(true);
    const [endGame, setEndGame] = useState(false);
    const [score, setScore] = useState();
    const [winnerName, setWinnerName] = useState("");
    const soundOn = useSoundOn();
    const [startSoundRoundStart, setStartSoundRoundStart] = useState(false);
    const [startSoundRoundEnd, setStartSoundRoundEnd] = useState(false);
    const [startSoundEndGame, setStartSoundEndGame] = useState(false);
    let roundEndSound = new Audio("/sounds/roundEnd.mp3")
    let endGameSound = new Audio("/sounds/finish.mp3")
    let sessionId = sessionStorage.getItem('id');
    // if (startSoundRoundEnd && soundOn) {
    //     roundEndSound.play();
    // }

    if (startSoundEndGame && soundOn) {
        endGameSound.play();
    }

    // useEffect(() => {
    //     const unloadCallback = (event) => {
    //         event.preventDefault();
    //         event.returnValue = "";
    //         return "";
    //     };

    //     window.addEventListener("beforeunload", unloadCallback);
    //     return () => window.removeEventListener("beforeunload", unloadCallback);
    // }, []);

    socket.on('startTimer', ({ time }) => {
        setEndTime(false);
        setTime(time);
        setStartSoundRoundEnd(true);
    })

    socket.on('disconnection', (playerId) => {
        console.log('players', playerId)
        setPlayersList((current) =>
            current.filter((player) => player.playerId !== playerId)
        );
    })


    socket.on('updateScore', (data) => {
        let drawer = playersList.find(player => player.playerId === data.drawerID.name.playerId);
        drawer.score = data.drawerID.score;


        let player = playersList.find(player => player.playerId === data.playerID);
        player.score = data.score;
        setPlayersList([...playersList]);
    })

    socket.on('endGame', async ({ stats }) => {
        let highestScore = -1;
        let highestScoringUserId = "";
        // let players = Object.keys(stats).filter((val) => val.length === 20);
        // players.forEach((player) => {
        //     if (player.score > highestScore) {
        //         highestScore = player.score;
        //         highestScoringUserId = player.name.playerId;
        //     }
        // })
        for (let userId in stats) {
            if (userId !== "rounds" && userId !== "time" && userId !== "totalGuesses" && userId !== "currentWord" && userId !== "drawer" && userId !== "startTime") {
                if (stats[userId].score > highestScore) {
                    highestScore = stats[userId].score;
                    highestScoringUserId = userId;
                }
            }
        }
        let winner = playersList.find(player => player.playerId === highestScoringUserId);
        setTime(0);
        await setWinnerName(winner.name);
        setEndGame(true);
        await setStartSoundRoundEnd(false);
        setStartSoundEndGame(true);
    })

    return (

        <>

            <main className='flex flex-col items-center gap-2 h-full m-auto relative'>
                <div className="md:block hidden">
                    <Header />
                </div>
                <img className='object-cover absolute h-screen w-screen bg-object bg-cover -z-10 top-0' src=".\img\fondpop.png" alt="popcorn rouge fond" />
                <div className='bg-black/25 w-screen h-2/4 -z-10 absolute top-0'></div>
                {time > 0 ? <Timer time={time} /> : <div className=' justify-center mb-2 mt-5 h-[41px] py-1 px-2 text-xl md:flex hidden'></div>}
                {
                    endGame ?
                        <ResultsGameOverlay winnerName={winnerName} playersList={playersList} />
                        :


                        <section className='max-w-screen-xl bg-center justify-center md:w-auto w-full md:h-[60%] h-[100%] mt-9o
                 flex content-center z-10 relative fade-in  backdrop-blur'>
                            <div className='absolute -top-[68px] left-[2%] md:block hidden'>
                                <BackButton to={"/"} state={false} />
                            </div>
                            <div className="w-20 absolute right-[15%] -top-[72px] mb:block hidden">
                                <SoundButton />
                            </div>
                            <div className='mt-4 min-h-[70%] border-white/20 border bg-slate-50 bg-opacity-10 flex rounded-md backdrop-blur-sm md:w-auto w-full flex-col md:flex-row'>

                                <PlayerList playersList={playersList} />

                                <Canva playersList={playersList} />
                                <Chat />
                            </div>
                        </section>
                }
                <Paricules />
            </main >
        </>

    );
}

export default Canvas;