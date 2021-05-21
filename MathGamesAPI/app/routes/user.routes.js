const authorize = require('../config/authorize')
const Role = require('../config/roles');
const { authJwt } = require("../middleware");

module.exports = app => {
    const users = require("../controllers/user.controller.js");
  
    var router = require("express").Router();
  
    // Create a new User
    router.post("/", users.create);
  
    // Retrieve all Users
    router.get("/", users.findAll);

    // Retrieve all Users with Admin permissions
    router.get("/admin", [authJwt.verifyToken, authJwt.isAdmin], users.findAllAdmin);
  
    // Retrieve a single User with id
    router.get("/:id", users.findOne);
  
    // Update a User with id
    router.put("/:id", authJwt.verifyToken, users.update);
  
    // Delete a User with id
    router.delete("/:id", users.delete);
  
    // Delete all Users
    router.delete("/", users.deleteAll);
  

    // Login
    router.post("/login", users.authenticate);

    // Register
    router.post("/register", users.register);

    router.get('/gamePage', authorize(Role.Admin), users.findAll);            // admin only
    router.get('/gamesDashboard', authorize(Role.User), users.findAll);       // all authenticated users

    app.use('/api/users', router);
  };