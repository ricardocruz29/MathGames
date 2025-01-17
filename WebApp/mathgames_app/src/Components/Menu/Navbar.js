/* React and React-Icons */
import React, { useState, useEffect } from 'react';
import { withRouter, useHistory } from "react-router-dom";
import {IconContext} from 'react-icons';
import * as FaIcons from 'react-icons/fa';
import * as FiIcons from "react-icons/fi";
import * as IoIcons from 'react-icons/io5';
import * as MdIcons from 'react-icons/md';
import * as CgIcons from 'react-icons/cg';
import { Link } from 'react-router-dom';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

/* Css */
import './Menu.css'

/* Data and Service */
import AuthService from '../../Services/auth.service';
import UserService from '../../Services/user.service';
import TournamentService from '../../Services/tournament.service';

import {urlWeb} from './../../data/data';

import Avatar from "../../Components/Avatar/Avatar";
import socket from "../../index"

import { Modal } from "react-bootstrap";

import { Card } from "react-bootstrap";

/* Redux */
import { useDispatch } from 'react-redux';

/* ChooseGameModalFriends */
import { games_info } from "../../data/GamesInfo";

function Navbar() {
	const dispatch = useDispatch();

    const [user_authenticated, setUser_authenticated] = useState(true);
    const [user, setUser] = useState("");

    const [friends, setFriends] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const [avatarCustoms, setAvatarCustoms] = useState({
		hat: "none",
		shirt: "none",
        color: "#FFAF00",
		accessorie: "none",
        trouser: "none",
	});

	const [modalConfirmShow, setConfirmModalShow] = useState(false);
	const [modalUsername, setModalUsername] = useState("");
	const [modalId, setModalUserId] = useState(0);

	const [modalChooseGame, setModalChooseGame] = useState(false);
	const [InvUser, setInvUser] = useState([]);

	let history = useHistory();

	var choosenGame = -1;

	function ExpireModal(props) {
        return (
          <Modal
            {...props}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter" style={{color: "#0056b3", fontSize: 30}}>
                Convite expirou
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p style={{color: "#0056b3", fontSize: 20}}>O convite já não está disponível. </p>
            </Modal.Body>
            <Modal.Footer>
				<div id="cancel-b" title="Confirmar" onClick={props.onHide}  className="button-clicky-modal confirm-modal">
					<span className="shadow"></span>
					<span className="front">Confirmar</span>
				</div>
            </Modal.Footer>
          </Modal>
        );
      }
	
	function GameModal(props) {
	return (
		<Modal
		{...props}
		size="md"
		aria-labelledby="contained-modal-title-vcenter"
		centered
		>
		<Modal.Header closeButton>
			<Modal.Title id="contained-modal-title-vcenter" style={{color: "#0056b3", fontSize: 30}}>
			Convidar {InvUser[1]} para jogar!
			</Modal.Title>
		</Modal.Header>
		<Modal.Body>
			<p style={{color: "#0056b3", fontSize: 20}}>Escolhe o jogo que queres jogar</p>
			<div className="row modal-games">
				{Object.entries(games_info).map(([key, value]) => (		
					<div className={value["toBeDone"] ? "not-display" : "col-lg-6 centered set-padding"} key={key} id={key + "_Card"}>
						{/* <Card id={"card-" + value["title"]} className="game-card" onClick={() => {setGameId(value["id"]);}}> */}
						<Card id={"card-" + value["title"]} className="game-card" onClick={() => {choosenGame = value["id"];changeGame(value["title"])}}>
							<div>
							
								<img src={value["img"]}
										alt="Info"
										className="game-img"
										id={key}
										/>
							
								<h2>
									{value["title"]}
								</h2>
							</div>
						</Card>
					</div>
				))}
			</div>

		</Modal.Body>
		<Modal.Footer>
			<div id="confirm-b" title="Confirmar" onClick={() => {button_confirm(InvUser[0])}}  className="button-clicky-modal confirm-modal">
				<span className="shadow"></span>
				<span className="front">Confirmar</span>
			</div>
			<div id="cancel-b" title="Cancelar" onClick={props.onHide}  className="button-clicky-modal cancel-modal">
				<span className="shadow"></span>
				<span className="front">Cancelar</span>
			</div>
		</Modal.Footer>
		</Modal>
	);
	}


	function ConfirmOperationModal(props) {
		let modal_username = props.username;

        return (
          <Modal
            {...props}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter" style={{color: "#0056b3", fontSize: 30}}>
                Remover Amizade com {modal_username}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p style={{color: "#0056b3", fontSize: 20}}>Tem a certeza que pretende remover a sua amizade com {modal_username}</p>
            </Modal.Body>
            <Modal.Footer>
				<div title="Confirmar" onClick={() => {remove_friend(props.id); props.onHide();}}  className="button-clicky-modal confirm-modal">
					<span className="shadow"></span>
					<span className="front">Confirmar</span>
				</div>
				<div title="Cancelar" onClick={props.onHide}  className="button-clicky-modal cancel-modal">
					<span className="shadow"></span>
					<span className="front">Cancelar</span>
				</div>
            </Modal.Footer>
          </Modal>
        );
      }

	function button_confirm(user_id){
		if (choosenGame === -1){
			alert("Seleciona um jogo")
		} else{
			setModalChooseGame(false)
			invite_for_game(user_id);
		}	
	}

	function changeGame(game){
		document.getElementById("confirm-b").disabled = false;
		const cards =  []
		for (var [key,value] of Object.entries(games_info)) {
			if (!value["toBeDone"] && key !== -1){
				
				var card = document.getElementById("card-" + value["title"]);
				cards.push(
					{ key: value["title"],
					  value:card
					}
				);
			}
		}

		for (let i = 0; i < cards.length; i++){
			if (game === cards[i].key){
				if (cards[i].value.classList.contains("not-active")){
					cards[i].value.classList.remove("not-active")
				}
				cards[i].value.classList.add("active") 
			} else {
				if (cards[i].value.classList.contains("active")){
					cards[i].value.classList.remove("active")
				}
				cards[i].value.classList.add("not-active") 
			}
		} 
	}

	

	var current_user = AuthService.getCurrentUser();

	const deleteNotification = (e) => {
        const newNotifications = [...notifications];
        newNotifications.splice(e, 1);
        setNotifications(newNotifications);
    }

	const getLevel = (account_level) => {
		var contador = 1;
		if (typeof account_level !== "undefined") {
			while (true) {
				var minimo = contador === 1 ? 0 : 400 * Math.pow(contador-1, 1.1);
				var maximo = 400 * Math.pow(contador, 1.1);
				if ( (minimo <= account_level) && (account_level < maximo)) {
					return contador;
				}
				contador++;
			}
		} else {
			return 0;
		}
	}

	async function invite_for_game(invited_player) {
		console.log("tou mandar invite")
		localStorage.setItem("jogoporinvite", true)
		localStorage.setItem("outrojogador", invited_player)
		var url = "/gamePage?id=" + choosenGame
		history.push(url)
		//window.location.assign(urlWeb+url)
		
	}

	async function accept_game(notification, index) {
		deleteNotification(index);
		await UserService.delete(notification.id);
		var id_outro_jogador = notification.sender_user.sender_id
		
		socket.once("match_link", (msg) => {
			if (msg["match_id"]) {
				let new_match_id = msg['match_id'];
				let game_id = msg['game_id']

				localStorage.setItem("entreijogoporinvite", true)
				localStorage.setItem("outrojogador", id_outro_jogador)
				var url = "/gamePage?id="+game_id+"&mid=" + new_match_id
				history.push(url)
				//window.location.assign(urlWeb+url)
			} else if (msg["error"]) {
				setConfirmModalShow(true)
			}
		})

		socket.emit("get_match_id", {"user_id": AuthService.getCurrentUserId(), "outro_id": id_outro_jogador})
	}

	function deny_game(notification) {
		var receiver = notification.sender_user.sender_id
		var notification_text = current_user.username + " recusou o seu convite."
		socket.emit("new_notification", {"sender": current_user.id, "receiver": receiver, "notification_type": "D", "notification_text": notification_text})
	}



	function run_logout() {
		sessionStorage.removeItem("user");
		window.location.assign(urlWeb)
	}

	async function friendRequest() {
		var input = document.getElementById("inputFriend")
		var other_username = input.value
		var notification_text = current_user.username + " enviou-te um pedido de amizade."
		if (other_username !== undefined && other_username !== null && other_username !== "") {
			//UserService.send_notification_request_by_username(current_user.id, other_username, "F", notification_text);
			var receiver = await UserService.getUserByUsername(other_username)
			if (receiver !== null && receiver !== undefined) {
				let inviteFriendSucesso = document.getElementById("sucesso")
				if (inviteFriendSucesso !== null && inviteFriendSucesso !== undefined)
					inviteFriendSucesso.style.display = "flex"
				socket.emit("new_notification", {"sender": current_user.id, "receiver": receiver.id, "notification_type": "F", "notification_text": notification_text})
			} else  {
				let inviteFriendErro = document.getElementById("erro")
				if (inviteFriendErro !== null && inviteFriendErro !== undefined)
					inviteFriendErro.style.display = "flex"
			}
			let inviteFriendMessage = document.getElementById("inviteFriendMessage")
			if (inviteFriendMessage !== null && inviteFriendMessage !== undefined)
				inviteFriendMessage.style.display = "flex"
		}
		input.value = ""
		hideAddFriendInput();
	}

	async function accept_friendRequest(notification) {
		await UserService.accept_friendship(notification);
		var notification_text = current_user.username + " aceitou o teu pedido de amizade."
		socket.emit("new_notification", {"sender": current_user.id, "receiver": notification.sender_user.sender_id, "notification_type": "A", "notification_text": notification_text})
		fetchFriends()
	}

	async function remove_friend(friend2) {
		await UserService.remove_friend(current_user.id, friend2);
		var notification_text = current_user.username + " removeu-te da sua lista de amigos."
		socket.emit("new_notification", {"sender": current_user.id, "receiver": friend2, "notification_type": "N", "notification_text": notification_text})
		fetchFriends()
	}

	async function goToTournament(notification, index) {
		deleteNotification(index);
		await UserService.delete(notification.id);
		var torneio_id = notification.torneio_id
		window.location.assign(urlWeb+"tournament?id="+torneio_id)

	}

	// Load user notifications
	async function fetchNotifications() {
		var response = await UserService.getNotifications(current_user.id);
		if ( response != null ) {
			for (let notify of response) {
				if (notify.notification_type === "R") {
					var nomeTorneio = notify.notification_text.slice(0,-59)
					var torneio = await TournamentService.getTournamentByName(nomeTorneio)
					notify["torneio_id"] = torneio.id
				}
			}
			setNotifications(response);
		}
	}

	// Load user friends list
	async function fetchFriends() {
		var response = await UserService.getFriends(current_user.id);
		if ( response != null )
			setFriends(response);
	}

	socket.off("reload_notifications")
	
	socket.on("reload_notifications", (msg) => {
		fetchNotifications();
		fetchFriends();
	})


    // Tem de colocar no redux o tipo de user
    useEffect(() => {
		var current_user = AuthService.getCurrentUser();
		setUser(current_user);

		// Load user friends list
        async function fetchApiFriends() {
            var response = await UserService.getFriends(current_user.id);
			if ( response != null )
            	setFriends(response);
        }

		// Load user notifications
        async function fetchApiNotifications() {
            var response = await UserService.getNotifications(current_user.id);
			if ( response != null ) {
				for (let notify of response) {
					if (notify.notification_type === "R") {
						var nomeTorneio = notify.notification_text.slice(0,-59)
						var torneio = await TournamentService.getTournamentByName(nomeTorneio)
						if (torneio !== null && torneio !== undefined)
							notify["torneio_id"] = torneio.id
						else {
							UserService.delete(notify.id)
							response.splice(response.indexOf(notify), 1)
						}
					}
				}
				setNotifications(response);
			}
        }

		// Load Avatar
		async function fetchApiUserById() {
            var user = await UserService.getUserById(current_user.id);
            setUser(user);
            setAvatarCustoms({
                hat: user.avatar_hat,
                shirt: user.avatar_shirt,
                color: user.avatar_color,
                accessorie: user.avatar_accessorie,
                trouser: user.avatar_trouser,
            });
        }

		if (current_user !== null) {
            setUser_authenticated(true);
            fetchApiFriends();
            fetchApiNotifications();
			fetchApiUserById();
            dispatch({
                type: 'NFREEUSER'
            });
        } else {
            setUser_authenticated(false);
            dispatch({
                type: 'FREEUSER'
            });
        }

    }, [dispatch])


	function showAddFriendInput(){
		let inviteFriend_Separator_div = document.getElementById("inviteFriend-Separator");
		let inviteFriend_div = document.getElementById("inviteFriend");
		let inviteFriendMessage = document.getElementById("inviteFriendMessage")
		let inviteFriendSucesso = document.getElementById("sucesso")
		let inviteFriendErro = document.getElementById("erro")
		if (inviteFriend_div !== null && inviteFriend_div !== undefined)
			inviteFriend_div.style.display = "flex"
		if (inviteFriend_Separator_div !== null && inviteFriend_Separator_div !== undefined)
			inviteFriend_Separator_div.style.display = "flex";
		if (inviteFriendMessage !== null && inviteFriendMessage !== undefined)
			inviteFriendMessage.style.display = "flex"
		if (inviteFriendSucesso !== null && inviteFriendSucesso !== undefined)
			inviteFriendSucesso.style.display = "none"
		if (inviteFriendErro !== null && inviteFriendErro !== undefined)
			inviteFriendErro.style.display = "none"
	}

	function hideAddFriendInput(){
		let inviteFriend_Separator_div = document.getElementById("inviteFriend-Separator");
		let inviteFriend_div = document.getElementById("inviteFriend");
		if (inviteFriend_div !== null && inviteFriend_div !== undefined)
			inviteFriend_div.style.display = "none";		
		if (inviteFriend_Separator_div !== null && inviteFriend_Separator_div !== undefined)
			inviteFriend_Separator_div.style.display = "none";
	}


	function hide_message(id) {
		let inviteFriendMessage = document.getElementById("inviteFriendMessage")
		if (inviteFriendMessage !== null && inviteFriendMessage !== undefined)
			inviteFriendMessage.style.display = "none"
		
		var elemento = document.getElementById(id)
		if (elemento !== null && elemento !== undefined)
        	elemento.style.display = "none"
    }
	
	return (
		<IconContext.Provider value={{color: 'grey'}}>
			<div id="horizontal_nav_row" className="navbar-row sticky-top">

				<div id="row-logo" className="logo-bars-section">
					<div className="nav-logo ml-5">
						<Link to="/">
							<img  className="logo" src={process.env.PUBLIC_URL + "/images/logo-light.png"}  alt="logo"/>
						</Link>
					</div>
				</div>

				{/* <MdIcons.MdModeEdit size={40} id="edit-icon" className="edit-icon" title="editar" onClick={() => make_fields_editable()}/> */}

				{user_authenticated &&
				
					<div className="navbar-icons-flex">
						<div title="Notificações" className="d-flex align-items-center justify-content-center">
							<span id="notifs-number" style={{ color: notifications.length ? "red" : "rgb(2, 204, 255)" }}>{ notifications.length }</span>
							<DropdownButton	menuAlign="right" title={<FaIcons.FaBell className={notifications.length ? "navbar-icon-active  notifications-animation" : "navbar-icon"}/>} id="notifs-dropdown" className="navbar-dropdown">
								<Dropdown.ItemText><h4>Notificações</h4></Dropdown.ItemText>
								<Dropdown.Divider />
								{ notifications.length > 0 &&
								<Dropdown.ItemText>
									<div className="navbar-dropdown-row">
										{notifications.map(function(notification, index) {
											var current_date = new Date();
											current_date = current_date.getTime() / 60000;
											var notification_date = new Date(notification.createdAt).getTime() / 60000;
											var difference = current_date - notification_date;
											return (
												<div className="row">
													<div className="col-9" style={{fontSize: 18}}>
														{
														/* Notification_Type List:
															- F -> Enviou pedido de amizade
															- A -> Aceitou pedido de amizade
															- N -> Removeu da lista de amigos
															- T -> Convidou para participar no torneio
															- P -> Convidou-te para uma partida
															- D -> Recusou convite para partida
															- R -> Iniciou um novo round do torneio
														*/
														}
														<p style={{marginBottom: "0.3em"}}>{notification.notification_text}</p>
														{ (difference < 60 &&
															<p style={{fontSize: 13}}>há { Number.parseInt(difference)} minutos</p>)
														|| ( 60 <= difference & difference < 60 * 24 &&
															<p style={{fontSize: 13}}>há { Number.parseInt(difference/60)} horas</p>)
														|| ( 60 * 24 <= difference &&
															<p style={{fontSize: 13}}>há { Number.parseInt(difference/(60*24))} dia</p>)   
														}
													</div>
													<div className="col-3" >
														<div className="text-right text-bottom" style={{marginTop: "20%"}}>
															{ (notification.notification_type === "F" && 
																<FaIcons.FaCheckCircle onClick={ async () => {accept_friendRequest(notification); deleteNotification(index);}} className="icon_notifications" style={{fontSize: 25}} color="#03f900" />)
															|| (notification.notification_type === "T" && 
																<FaIcons.FaCheckCircle  className="icon_notifications" style={{fontSize: 25}} color="#03f900" />)
															|| (notification.notification_type === "P" && 
																<FaIcons.FaCheckCircle  onClick={ () => {accept_game(notification, index);}} className="icon_notifications" style={{fontSize: 25}} color="#03f900" />)
															|| (notification.notification_type === "R" && 
																<FaIcons.FaCheckCircle  onClick={ () => {goToTournament(notification, index)}} className="icon_notifications" style={{fontSize: 25}} color="#03f900" />)
															}
															
															{ (notification.notification_type === "P") ?
																	<FaIcons.FaTimesCircle className="icon_notifications" onClick={ () => {deny_game(notification); UserService.delete(notification.id); deleteNotification(index); }} style={{fontSize: 25, marginLeft: "5px"}} color="#ff0015" />
																: 	<FaIcons.FaTimesCircle className="icon_notifications" onClick={ () => {UserService.delete(notification.id); deleteNotification(index); }} style={{fontSize: 25, marginLeft: "5px"}} color="#ff0015" />
															}

														</div>
														
													</div>
												</div>
											);
										})}
									</div>
								</Dropdown.ItemText>
								}
								{ notifications.length === 0 &&
									<Dropdown.ItemText>
										<div className="row navbar-dropdown-row">
											<Dropdown.ItemText>Não possui nenhuma notificação.</Dropdown.ItemText>
										</div>
									</Dropdown.ItemText>
								}
							</DropdownButton>
						</div>


						<ExpireModal
							show={modalConfirmShow}
							onHide={() => {setConfirmModalShow(false);}}
						/>



						<div title="Amigos" className="d-flex align-items-center justify-content-center">
							<DropdownButton	menuAlign="right" title={<FaIcons.FaUserFriends className="navbar-icon" onClick={() => hideAddFriendInput()}/>} id="friends-dropdown">
								<Dropdown.ItemText>
									<div className="friends-modal">
										<h4>Amigos</h4>
										<div onClick={() => showAddFriendInput()} title="Adicionar amigo" className="button-add-friend">
											<span className="shadow"></span>
											<span className="front"><FaIcons.FaUserPlus size={24} color={"white"}/></span>
										</div>
									</div>
								</Dropdown.ItemText>
								<Dropdown.Divider />
								<Dropdown.ItemText id="inviteFriend" style={{display: "none"}}>
									<div className="addFriendRow">
										<input id="inputFriend" type="text" className="inputAddFriend" placeholder="username"></input>
										<div onClick={() => friendRequest()} title="Enviar pedido" className="invite-friend-button">
											<span className="shadow"></span>
											<span className="front">Enviar</span>
										</div>
										{/* <button type="button" onClick={() => friendRequest()}>Enviar</button> */}
									</div>
							
								</Dropdown.ItemText>
								<Dropdown.ItemText id="inviteFriendMessage" style={{display: "none"}}t>
										<div id={"sucesso"} className="alert alert-success" role="alert" style={{margin:"10px auto", width: "95%", textAlign:"center", fontSize:"14px", display:"none"}}> 
											Pedido enviado com sucesso
											<img src={process.env.PUBLIC_URL + "/images/crossicon.png"}  style={{width: "10%", height: "auto", marginLeft:"8px"}} alt={"Close Icon"} onClick={() => hide_message("sucesso")}></img>
										</div> 

										<div id={"erro"} className="alert alert-danger" role="alert" style={{margin:"10px auto", width: "95%", textAlign:"center", fontSize:"14px", display:"none"}}> 
											Utilizador não encontrado
											<img src={process.env.PUBLIC_URL + "/images/crossicon.png"}  style={{width: "10%", height: "auto", marginLeft:"8px", fontSize:"14px"}} alt={"Close Icon"} onClick={() => hide_message("erro")}></img>
										</div> 
								</Dropdown.ItemText>
								<Dropdown.Divider id="inviteFriend-Separator" style={{display: "none"}} />

								{ friends.length > 0 &&
								<Dropdown.ItemText>{
									<>
										<ul className="list-friends">
										{friends.map(function(user, index) {
											return (
												<li key={user.id} className="list-item-friends">
													{user.username}
													<div>
														{/* <FaIcons.FaEnvelopeSquare title="Convidar para jogo" className="icon_notifications" style={{fontSize: 25}} onClick={() => {invite_for_game(user.id)}} /> */}
														
														<div onClick={() => {setModalChooseGame(true); setInvUser([user.id, user.username])}} title="Convidar para jogo" className="button-add-friend invite-friend-modal">
															<span className="shadow"></span>
															<span className="front"><FaIcons.FaEnvelopeSquare color={"white"} style={{fontSize: 25}}  /></span>
														</div>
														<div onClick={() => {setModalUserId(user.id); setModalUsername(user.username); setConfirmModalShow(true);}} title="Remover Amigo" className="button-add-friend remove-friend-modal">
															<span className="shadow"></span>
															<span className="front"><IoIcons.IoPersonRemove  className="icon_notifications" color={"white"} style={{fontSize: 25}}  /></span>
														</div>
		
														
													</div>
												</li>
											);
										})}
										</ul>
										<ConfirmOperationModal
										show={modalConfirmShow}
										onHide={() => setConfirmModalShow(false)}
										username={modalUsername}
										id={modalId}
									/>
									</>
								}</Dropdown.ItemText>
								}
								{ friends.length === 0 &&
								<Dropdown.ItemText>
									<div className="row">
										Não possui amigos.
									</div>
								</Dropdown.ItemText>
								}
							</DropdownButton>
						</div>



						<div>
							<div title="Perfil" className="round_profile_logo">

								<DropdownButton	menuAlign="left" title={<>
									<Avatar navbar={true} skinColor={avatarCustoms.color} hatName={avatarCustoms.hat} shirtName={avatarCustoms.shirt} accesorieName={avatarCustoms.accessorie} trouserName={avatarCustoms.trouser}/>
									<MdIcons.MdKeyboardArrowDown color={"rgb(2, 204, 255)"} className="key-down"/>
								</>}
								id="user_dropdown">
									<Dropdown.ItemText>
										<div className="perfil-info-modal">
											<h5>{user.username} </h5>
											<h5>Nivel: {getLevel(user.account_level)} </h5>
										</div>
									</Dropdown.ItemText>
									<Dropdown.Divider />
									
									<Dropdown.ItemText>{
										<Link to="/profile" title="" className="remove-decoration icon-word">
											<CgIcons.CgProfile/><h4>Perfil</h4>
										</Link>
									}</Dropdown.ItemText>

									<Dropdown.Divider />
									<Dropdown.ItemText>{ 
										<Link to="/" title="" className="remove-decoration icon-word">
											<FiIcons.FiLogOut className="icon_notifications" onClick={run_logout}/>
											<h4 onClick={run_logout}>Terminar Sessão</h4>
											
										</Link>
									}</Dropdown.ItemText>
								</DropdownButton>

							
							</div>
							<h5 className="user-name">{user.username} </h5>
						</div>
						
					<GameModal
						show={modalChooseGame}
						onHide={() => {setModalChooseGame(false);}}
					/>
				</div>
				}
				
				{!user_authenticated &&
				<div className="navbar-icons-flex login-case">
					<Link to="/login" className="login-button">
						<FiIcons.FiLogIn className="navbar-icon" title="login"/>
						<h2 className="h2-login">Login </h2>
						
					</Link>
				</div>
				}
			</div>
			{/* <Toaster toastOptions={{
            className: '',
            style: {
            border: '1px solid #4BB543',
            padding: '16px',
            color: '#4BB543',
            },
            }} /> */}

			<div style={{display:"none", visibility:"hidden"}}>
				{/*<Link id="linktogame" to={linktogamehref}>
				
				</Link>
	
				<Link id="linktogame2" to={linktogame2href}>
					
				</Link>

				<Link id="linktotournament" to={linktotournamenthref}>
					
				</Link>*/}
			</div>
		</IconContext.Provider>
	)
}

export default withRouter(Navbar);