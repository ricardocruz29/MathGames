import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "./Game.css"
import "bootstrap/dist/css/bootstrap.min.css";
import { RastrosEngine } from "../../Components/Engines/RastrosEngine";
import { GatosCaesEngine } from "../../Components/Engines/GatosCaesEngine";
import socket from "../../index"
import AuthService from '../../Services/auth.service';

import * as FaIcons from "react-icons/fa";
import {IconContext} from 'react-icons';


function Game()  {
    var user = AuthService.getCurrentUser();
    console.log(user);
    const [game_ready_to_start, setReady] = useState(false);
    
    const url = new URLSearchParams(window.location.search);
	let match_id = url.get("id");

    let history = useHistory()
    var params = history.location.state
    var game_id, game_mode, ai_diff, player, opponent;

    if ( match_id !== null ) {
        game_id = parseInt( url.get("g") );
        game_mode = "amigo";
        ai_diff = undefined;
        player = user !== null ? user.username : player = "Guest_" + sessionStorage.getItem("user_id");
    }
    else {
        game_id = parseInt( params.game_id );
        game_mode = params.game_mode;
        ai_diff = params.ai_diff;
        player = params.player;
        opponent = params.opponent;
    }

    function copy() {
        var link = document.getElementById("link");
        
        link.select();
        link.setSelectionRange(0, 99999); /* For mobile devices */

        document.execCommand("copy");

        /* Alert the copied text */
        alert("O link foi copiado!");
    }

    // Game is ready to start when both players are connected
    if ( game_ready_to_start === false ) {
        if ( match_id !== null ) {
            if (user === null)
                socket.emit("entered_link", {"user_id": sessionStorage.getItem("user_id"), "match_id": match_id, "game_id": game_id})
            else
                socket.emit("entered_link", {"user_id": String(user.id), "match_id": match_id, "game_id": game_id})

            socket.on("match_found", (msg) => {
                console.log("Match_Found")
                sessionStorage.setItem('match_id', msg['match_id']);
                sessionStorage.setItem('starter', msg['starter']);
                sessionStorage.setItem('opponent', msg['opponent'])
                setReady(true)
            })
        } else {
            setReady(true)
        }
        return (
            <div className="col-lg-12 link-geral-position">
                <IconContext.Provider  value={{color: 'white'}}>
                    <div className="link-card">
                        <h2>Copia o link para convidar alguém!</h2>
                        <hr className="link-hr"></hr>
                        <div className="bottom-link row">
                            <input readOnly={true} className="link" id="link" value={(process.env.NODE_ENV === "development" ? "http://localhost:3000/" : 'http://138.68.191.32/') + "game/?"+url.toString()}></input>
                            <div className="div-link-button">
                                <button id="button-copy" className="button-copy" onClick={() => copy()}><i className="copy-icon"><FaIcons.FaCopy/></i></button>
                            </div>
                        </div>
                    </div>
                </IconContext.Provider>
            </div>
        );
    } else {
        if ( game_id === 0 ) {
            return (
                <div className="container-fluid">
                    <div className="row">
                    <div className="col-3 mt-4">
                            <div className="row h-75 d-flex justify-content-center">
                                <div className="col">
                                    <div className="row d-flex justify-content-center">
                                        {game_mode !== "offline" && sessionStorage.getItem("starter")==="false" && <h5>Player 1</h5>}
                                        {game_mode !== "offline" && sessionStorage.getItem("starter")==="true"  && <h5>Player 2</h5>}
                                        {game_mode === "offline" && <h5>Player 2</h5>}
                                    </div>
                                    <div className="row d-flex justify-content-center">
                                        <h5 className="name-text">{opponent !== undefined && opponent}</h5>
                                        <h5 className="name-text">{opponent === undefined && sessionStorage.getItem('opponent')}</h5>
                                    </div>
                                </div>
                            </div>
                            <div className="row h-25 d-flex justify-content-center">
                                <div className="col">
                                    <div className="row d-flex justify-content-center">
                                        {game_mode !== "offline" && sessionStorage.getItem("starter")==="true" && <h5>Player 1 (Tu)</h5>}
                                        {game_mode !== "offline" && sessionStorage.getItem("starter")==="false"&& <h5>Player 2 (Tu)</h5>}
                                        {game_mode === "offline" && <h5>Player 1</h5>}
                                    </div>
                                    <div className="row d-flex justify-content-center">
                                        <h5 className="name-text">{player}</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-9">
                            <div id="my_div_game" className="container-canvas" style={{width: '1100px', height: '577px'}}>
                                <RastrosEngine arg_game_mode={game_mode} arg_ai_diff={ai_diff}></RastrosEngine>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        if ( game_id === 1 ) {
            return (
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-3 mt-4">
                            <div className="row h-75 d-flex justify-content-center">
                                <div className="col">
                                    <div className="row d-flex justify-content-center">
                                        {game_mode !== "offline" && sessionStorage.getItem("starter")==="false" && <h5>Player 1</h5>}
                                        {game_mode !== "offline" && sessionStorage.getItem("starter")==="true"  && <h5>Player 2</h5>}
                                        {game_mode === "offline" && <h5>Player 2</h5>}
                                    </div>
                                    <div className="row d-flex justify-content-center">
                                        <h5 className="name-text">{opponent !== undefined && opponent}</h5>
                                        <h5 className="name-text">{opponent === undefined && sessionStorage.getItem('opponent')}</h5>
                                    </div>
                                </div>
                            </div>
                            <div className="row h-25 d-flex justify-content-center">
                                <div className="col">
                                    <div className="row d-flex justify-content-center">
                                        {game_mode !== "offline" && sessionStorage.getItem("starter")==="true" && <h5>Player 1 (Tu)</h5>}
                                        {game_mode !== "offline" && sessionStorage.getItem("starter")==="false"&& <h5>Player 2 (Tu)</h5>}
                                        {game_mode === "offline" && <h5>Player 1</h5>}
                                    </div>
                                    <div className="row d-flex justify-content-center">
                                        <h5 className="name-text">{player}</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-9">
                            <div id="my_div_game" className="container-canvas" style={{width: '1200px', height: '624px'}}>
                            <GatosCaesEngine arg_game_mode={game_mode} arg_ai_diff={ai_diff}></GatosCaesEngine>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
    
}


export default Game;