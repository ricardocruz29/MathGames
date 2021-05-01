/* React and React-Icons */
import React, { useState, useEffect } from 'react';
import {IconContext} from 'react-icons';
import * as FaIcons from 'react-icons/fa';
import { Link } from 'react-router-dom';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import toast, { Toaster } from 'react-hot-toast';

/* Css */
import './Menu.css'

/* Uuid */
import { v4 as uuidv4 } from 'uuid';

/* Data and Service */
import AuthService from '../../Services/auth.service';
import FriendsService from '../../Services/friends.service';
import NotificationsService from '../../Services/notifications.service';

/* Redux */
import { useDispatch } from 'react-redux';

function Navbar() {
	const dispatch = useDispatch();

	//Talvez se venham a usar estes tambem, dont delete
    /*
    const [user, setUser] = useState(false);
    const [tournament_user, setTournament_user] = useState(false);
    */
    const [user_authenticated, setUser_authenticated] = useState(false);
    const [admin, setAdmin] = useState(false);
    const [user, setUser] = useState("");

    const [friends, setFriends] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const notifyFriendshipSucess = () => toast.success('Pedido de amizade aceite!', {
        icon: <FaIcons.FaCheckCircle />,
        duration: 3000,
        style:{fontSize: 20}
    });

    const notifyNotificationDelete = () => toast.success('Notificação removida com sucesso!', {
        icon: <FaIcons.FaCheckCircle />,
        duration: 3000,
        style:{fontSize: 20}
    });

	const deleteNotification = (e) => {
        const newNotifications = [...notifications];
        newNotifications.splice(e, 1);
        setNotifications(newNotifications);
    }

    // Tem de colocar no redux o tipo de user
    useEffect(() => {
		var current_user = AuthService.getCurrentUser();
		setUser(current_user);

		// Load user friends list
        async function fetchApiFriends() {
            var response = await FriendsService.getFriends(current_user.id);
            setFriends(response);
        }

		// Load user notifications
        async function fetchApiNotifications() {
            var response = await NotificationsService.getNotifications(current_user.id);
            setNotifications(response);
        }

        if (sessionStorage.getItem('user_id') === null)
            sessionStorage.setItem('user_id', uuidv4());		

		if (current_user !== null) {
            setUser_authenticated(true);
            fetchApiFriends();
            fetchApiNotifications();
            dispatch({
                type: 'NFREEUSER'
            });
        } else {
            setUser_authenticated(false);
            dispatch({
                type: 'FREEUSER'
            });
        }
    }, [])

	return (
		<IconContext.Provider value={{color: 'grey'}}>
			<div id="horizontal_nav_row" className="row sticky-top">

				<div id="row-logo" className="col d-flex align-items-center">
					<div className="nav-logo ml-5">
						<Link to="/">
							<img  className="logo" src={process.env.PUBLIC_URL + "/images/logo-light.png"}  alt="logo"/>
						</Link>
					</div>

				</div>

				{/* <hr className="menu-divider"></hr>  */}                     

				{ admin && <h1>Admin</h1> }
				{user_authenticated &&
					<div className="notif">
						<div className="notif_section">
							{/*
							<Link to="/notifications" className="notif_icon">
								<FaIcons.FaBell/>
							</Link>
							*/}
							{ notifications.length && 
								<DropdownButton
									menuAlign="right"
									title={<FaIcons.FaBell/>}
									id="dropdown-menu-align-right"
									className="notif_icon"
								>
									<Dropdown.ItemText><h4>Notificações</h4></Dropdown.ItemText>
									<Dropdown.Divider /> 
									<Dropdown.ItemText>{
										<div className="row">
											{notifications.map(function(notification, index) {
												var current_date = new Date();
												current_date.setTime(current_date.getTime() - new Date().getTimezoneOffset()*60*1000);
												current_date = current_date.getTime() / 60000;
												var notification_date = new Date(notification.notification_date).getTime() / 60000;
												var difference = current_date - notification_date;
												return (
													<>
													<div className="col-9" style={{width: 350, fontSize: 18}}>
														{ (notification.notification_type === "F" && 
															<p style={{marginBottom: "0.3em"}}>{notification.sender} enviou-te um pedido de amizade.</p>)
														|| (notification.notification_type === "T" && 
															<p style={{marginBottom: "0.3em"}}>{notification.sender} convidou-te para participares no seu torneio.</p>)
														|| (notification.notification_type === "P" && 
															<p style={{marginBottom: "0.3em"}}>{notification.sender} convidou-te para jogares.</p>)
														}
														{ (difference < 60 &&
															<p style={{fontSize: 13}}>há { Number.parseInt(difference)} minutos</p>)
														|| ( 60 <= difference & difference < 60 * 24 &&
															<p style={{fontSize: 13}}>há { Number.parseInt(difference/60)} horas</p>)
														|| ( 60 * 24 <= difference &&
															<p style={{fontSize: 13}}>há { Number.parseInt(difference/(60*24))} dia</p>)   
														}
													</div>
													<div className="col-3" style={{width: 100}} >
														<div className="text-right text-bottom" style={{height: "30px", marginTop: "40%"}}>
															{ (notification.notification_type === "F" && 
																<FaIcons.FaCheckCircle onClick={ () => {NotificationsService.accept_friendship(notification); notifyFriendshipSucess(); deleteNotification(index);}} className="icon_notifications" style={{fontSize: 25}} color="#03f900" />)
															|| (notification.notification_type === "T" && 
																<FaIcons.FaCheckCircle  className="icon_notifications" style={{fontSize: 25}} color="#03f900" />)
															|| (notification.notification_type === "P" && 
																<FaIcons.FaCheckCircle className="icon_notifications" style={{fontSize: 25}} color="#03f900" />)
															}
															<span> </span>
															<FaIcons.FaTimesCircle className="icon_notifications" onClick={ () => {NotificationsService.delete(notification.id); notifyNotificationDelete(); deleteNotification(index); }} style={{fontSize: 25}} color="#ff0015" />
														</div>
														
													</div>
													</>
												);
											})}
										</div>
									}</Dropdown.ItemText>
								</DropdownButton>
							}

							{ !notifications.length && 
								<DropdownButton
								menuAlign="right"
								title={<FaIcons.FaBell/>}
								id="dropdown-menu-align-right"
								className="notif_icon"
							>
								<Dropdown.ItemText><h4 style={{width: 350}}>Notificações</h4></Dropdown.ItemText>
								<Dropdown.Divider /> 
								<Dropdown.ItemText>Não possui nenhuma notificação.</Dropdown.ItemText>
							</DropdownButton>
							}
						</div>
					</div>
				}
				{user_authenticated &&
					<div className="friends">
						<div className="friends_section">
							{/*
							<Link to="/friends" className="friends_icon">
								<FaIcons.FaUserFriends/>
							</Link>
							*/}
							<DropdownButton
								menuAlign="right"
								title={<FaIcons.FaUserFriends/>}
								id="dropdown-menu-align-right"
								className="friends_icon"
							>
								<Dropdown.ItemText><div style={{width: 230}}><h4>Amigos</h4></div></Dropdown.ItemText>
								<Dropdown.Divider />
								{ notifications.length && 
									<>
									{ notifications.filter(function (e) {return e.notification_type === "F"}).length > 0 && 
										<>
										<Dropdown.ItemText>
											{notifications.map(function(notification, index) {
												return (
													<>
													{ notification.notification_type === "F" && 
														<div className="row" >
															<div className="col-7">
																<h5>{notification.sender}</h5>
															</div>
															<div className="col-5">
																<div className="text-right">
																	<FaIcons.FaCheckCircle onClick={ () => {NotificationsService.accept_friendship(notification); notifyFriendshipSucess(); deleteNotification(index);}} className="icon_notifications" style={{fontSize: 25}} color="#03f900" />
																	<span> </span>
																	<FaIcons.FaTimesCircle onClick={ () => {NotificationsService.delete(notification.id); notifyNotificationDelete(); deleteNotification(index); }} className="icon_notifications" style={{fontSize: 25}} color="#ff0015" />
																</div>
															</div>
														</div>
													}
													</>
													)
												})
											}
										</Dropdown.ItemText>
										<Dropdown.Divider />
										</>
									}
									</>  
								}
								{ friends.length &&
									<Dropdown.ItemText>{
										<div className="row">
											{friends.map(function(name, index) {
												return (
													<>
													<div className="col-9">
														<h5>{name.username}</h5>
													</div>
													<div className="col-3">
														<div className="text-right">
															<FaIcons.FaEnvelopeSquare className="icon_notifications" style={{fontSize: 25}} />
														</div>
													</div>
													</>
												);
											})}
										</div>
									}</Dropdown.ItemText>
								}
								{ !friends.length &&
									<Dropdown.ItemText>Ainda não possui amigos.</Dropdown.ItemText>
								}
							</DropdownButton>
						</div>
					</div>
				}
				
				{!user_authenticated &&
					<div className="col d-flex justify-content-end align-items-center mr-5">
						<hr className="menu-divider"></hr>
						<Link to="/login">
							<h2 className="h2-login">Login</h2>
						</Link>
					</div>
				}
				{/* <div className="account_info col">               
					{user_authenticated &&
						<div className="info">
							<h5>Nome: {user.username} </h5>
							<h5>Nivel: {user.account_level} </h5>  
						</div> 
					} 

					
					{user_authenticated &&
						<div className="round_profile_logo">
							<Link to="/profile">
								<img className="profile_logo" src={process.env.PUBLIC_URL + "/images/user-profile.png"}  alt="logo"/>
							</Link>
						</div>
					}
				</div> */}
			</div>
			{/* <Toaster toastOptions={{
            className: '',
            style: {
            border: '1px solid #4BB543',
            padding: '16px',
            color: '#4BB543',
            },
            }} /> */}
		</IconContext.Provider>
	)
}

export default Navbar;