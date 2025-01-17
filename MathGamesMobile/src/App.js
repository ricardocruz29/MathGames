import * as React from 'react';
import { Text, View, Image, StyleSheet, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import Welcome from './screens/Welcome';
import ChooseGame from './screens/ChooseGame';
import GamePage from './screens/GamePage';
import Login from './screens/Login';
import Profile from './screens/Profile';
import LastGames from './screens/LastGames';
import Inventory from './screens/Inventory';
import Friends from './screens/Friends';
import Ranking from './screens/Ranking';
import AboutUs from './screens/AboutUs';

import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import {readData, saveData, deleteData} from './utilities/AsyncStorage';
import Game from './screens/Game';
/* Uuid */
import { v4 as uuidv4 } from 'uuid';

import { DrawerActions } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Notifications from './screens/Notifications';

import * as ScreenOrientation from 'expo-screen-orientation';

import CustomisableAlert from "react-native-customisable-alert";
import socket from './utilities/Socket';
import { MaterialIcons } from '@expo/vector-icons';

export const navigationRef = React.createRef();
export function openDrawer(routeName, params) {
  navigationRef.current.dispatch(DrawerActions.toggleDrawer());
}

const win = Dimensions.get('window');

const Stack = createStackNavigator();

function Games() {
  const [currentGame, setCurrentGame] = useState({name: ""});
  useEffect(() => {
    let mounted = true;
    readData("game").then(value => {if (value !== null && mounted) {setCurrentGame(JSON.parse(value));}});
    return () => {mounted=false}
  }, [currentGame]);
  return (
    <Stack.Navigator screenOptions={{headerStyle: {backgroundColor: '#78c9ff'}}} initialRouteName="Jogos">
      <Stack.Screen name="Jogos" options={{headerTitle: () => (<Text style={styles.header}>Jogos</Text>)}} component={ChooseGame} />
      <Stack.Screen name="Jogo" options={{
        headerTitle: () => (<Text style={styles.headerWithArrow}>{currentGame.title}</Text>),
        headerTintColor: "white",
        headerTitleAlign: "center"
      }} component={GamePage} />
      <Stack.Screen name="Game" options={{
        headerTitle: () => (<Text style={styles.headerWithArrow}>{currentGame.title}</Text>),
        headerTintColor: "white",
        headerTitleAlign: "center"
      }} component={Game} />
    </Stack.Navigator>
  )
}

const StackProfile = createStackNavigator();

function ProfileNav() {

  return (
    <StackProfile.Navigator screenOptions={{headerStyle: {backgroundColor: '#78c9ff'}}}>
      <StackProfile.Screen name="Perfil" options={{headerTitle: () => (<Text style={styles.header}>Perfil</Text>)}} component={Profile} />
      <StackProfile.Screen name="Inventario" options={{
        headerTitle: () => (<Text style={styles.headerWithArrow}>Inventário</Text>),
        headerTintColor: "white",
        headerTitleAlign: "center"
      }} component={Inventory} />
      <StackProfile.Screen name="Ultimos Jogos" options={{
        headerTitle: () => (<Text style={styles.headerWithArrow}>Últimos jogos</Text>),
        headerTintColor: "white",
        headerTitleAlign: "center"
      }} component={LastGames} />
    </StackProfile.Navigator>
  )
}

const StackNotifications = createStackNavigator();

function NotificationsNav() {
  const [currentGame, setCurrentGame] = useState({name: ""});
  useEffect(() => {
    let mounted = true;
    readData("game").then(value => {if (value !== null && mounted) {setCurrentGame(JSON.parse(value));}});
    return () => {mounted=false}
  }, [currentGame]);

  return (
    <StackNotifications.Navigator screenOptions={{headerStyle: {backgroundColor: '#78c9ff'}}} initialRouteName="Notificações">
      <StackNotifications.Screen name="Notificações" options={{
        headerTitle: () => (<Text style={styles.header}>Notificações</Text>)
      }} component={Notifications} />
      <Stack.Screen name="Game" options={{
        headerTitle: () => (<Text style={styles.headerWithArrow}>{currentGame.title}</Text>),
        headerTintColor: "white",
        headerTitleAlign: "center"
      }} component={Game} />
    </StackNotifications.Navigator>
  )
}

const StackFriends = createStackNavigator();

function FriendsNav() {
  const [currentGame, setCurrentGame] = useState({name: ""});
  useEffect(() => {
    let mounted = true;
    readData("game").then(value => {if (value !== null && mounted) {setCurrentGame(JSON.parse(value));}});
    return () => {mounted=false}
  }, [currentGame]);

  return (
    <StackFriends.Navigator screenOptions={{headerStyle: {backgroundColor: '#78c9ff'}}} initialRouteName="Amigos">
      <StackFriends.Screen name="Amigos" options={{
        headerTitle: () => (<Text style={styles.header}>Amigos</Text>)
      }} component={Friends} />
      <StackFriends.Screen name="Game" options={{
        headerTitle: () => (<Text style={styles.headerWithArrow}>{currentGame.title}</Text>),
        headerTintColor: "white",
        headerTitleAlign: "center"
      }} component={Game} />
    </StackFriends.Navigator>
  )
}

const Drawer = createDrawerNavigator();

function App() {
  const [loaded] = useFonts({
    BubblegumSans: require('./../public/fonts/BubblegumSans-Regular.ttf'),
  });
  const [login, setLogin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  readData('username').then(username=>{
    if (username===null) {
      username = "Guest_"+uuidv4();
      saveData('user_id', username);
      saveData('username', username);
      socket.emit("new_user", {"user_id": username});
    } else {
      setUsername(username.slice(1, -1));
    }
  });

  if (!loaded) {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    deleteData("user");
    deleteData("user_id");
    deleteData("username")
    return <Text>Loading...</Text>;
  } else {
    return (
      <NavigationContainer ref={navigationRef}>
        {/*this alert needs to be here to be used everywhere*/}
        <CustomisableAlert/>
        <View style={styles.topView}>
          <TouchableOpacity onPress = {() => login ? setLogin(false) : openDrawer()}>
            <Feather name="menu" size={28} color="grey" style={styles.topIcon}/>
          </TouchableOpacity>

          <Image
              style={styles.logoImage}
              resizeMode = {'contain'}
              source={require('./../public/images/logo-light.png')}
            />

          <TouchableOpacity onPress={()=>loggedIn && navigationRef.current.dispatch(DrawerActions.jumpTo('Notificações'))}>
            <MaterialIcons name="notifications" size={28} color={loggedIn ? "#FFD300":"grey"} style={styles.topIcon}/>
          </TouchableOpacity>

          {loggedIn &&
            <TouchableOpacity style={styles.loginImage} onPress={()=>navigationRef.current.dispatch(DrawerActions.jumpTo('Perfil'))}>
              <Text style={styles.username} numberOfLines={1}>{username}</Text>
            </TouchableOpacity>
          }

          {(!loggedIn&&login) &&
            <TouchableOpacity onPress = {() => setLogin(!login)} style={styles.loginImage}>
              <Text style={styles.username}>Voltar</Text>
            </TouchableOpacity>
          }
          {(!loggedIn&&!login) &&
            <TouchableOpacity onPress = {() => setLogin(!login)}>
              <Image
                style={styles.loginImage}
                resizeMode = {'contain'}
                source={require('./../public/images/Login.png')}
              />
            </TouchableOpacity>
          }
        </View>
        {login ?
          <Login return={setLogin} login={setLoggedIn}/>
          :
          <Drawer.Navigator>
            <Drawer.Screen name="Bem-vindo" component={Welcome} options={{
                drawerLabel: () => (<Text style={{fontFamily: "BubblegumSans", fontSize: 20}}>Bem-vindo</Text>)}}/>
            <Drawer.Screen name="Jogos" component={Games} options={{
                drawerLabel: () => (<Text style={{fontFamily: "BubblegumSans", fontSize: 20}}>Jogos</Text>)}}/>
            <Drawer.Screen name="Classificações" component={Ranking} options={{
                drawerLabel: () => (<Text style={{fontFamily: "BubblegumSans", fontSize: 20}}>Classificações</Text>)}}/>
            {loggedIn && <Drawer.Screen name="Perfil" component={ProfileNav} options={{
                drawerLabel: () => (<Text style={{fontFamily: "BubblegumSans", fontSize: 20}}>Perfil</Text>)}}/>}
            {loggedIn && <Drawer.Screen name="Amigos" component={FriendsNav} options={{
                drawerLabel: () => (<Text style={{fontFamily: "BubblegumSans", fontSize: 20}}>Amigos</Text>)}}/>}
            {loggedIn && <Drawer.Screen name="Notificações" component={NotificationsNav} options={{
                drawerLabel: () => (<Text style={{fontFamily: "BubblegumSans", fontSize: 20}}>Notificações</Text>)}}/>}
            <Drawer.Screen name="Sobre Nós" component={AboutUs} options={{
                drawerLabel: () => (<Text style={{fontFamily: "BubblegumSans", fontSize: 20}}>Quem somos</Text>)}}/>
          </Drawer.Navigator>
        }
      </NavigationContainer>
    );
  }
  
}

export default App;

const styles = StyleSheet.create({
  topView: {
    flex:0.13,
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    margin:0,
    padding: 5
  },
  topIcon: {
    marginTop: Constants.statusBarHeight,
    marginLeft: 10
  },
  logoImage: {
      margin: 5,
      width: win.width/2.1,
      height: win.width*360/1463/2.1,
      marginTop: Constants.statusBarHeight
  },
  loginImage: {
    width: win.width/3,
    height: win.width*360/1463/3,
    marginTop: Constants.statusBarHeight
  },
  header: {
    color: "white",
    fontFamily: 'BubblegumSans',
    fontSize: 30,
    textAlign: "center"
  },
  headerWithArrow: {
    color: "white",
    fontFamily: 'BubblegumSans',
    fontSize: 30,
    textAlign: "center"
  },
  username: {
    color: "#78c9ff",
    fontFamily: 'BubblegumSans',
    fontSize: 22,
    textAlign: "center",
  },
});