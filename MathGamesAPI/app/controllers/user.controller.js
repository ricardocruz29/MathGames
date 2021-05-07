const db = require("../models");
const User = db.user;
const Op = db.Sequelize.Op;
const config = require("../config/auth.config")
var jwt = require("jsonwebtoken");

// Create and Save a new User
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a User
  const user = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  };

  // Save User in the database
  User.create(user)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    });
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  if (typeof req.query.orderby !== "undefined") {
    User.findAll({order: [[req.query.orderby, 'DESC']]})
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Users."
      });
    });
  } else {
    User.findAll()
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Users."
        });
      });
  }
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with id=" + id
      });
    });
};

// Update a User by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  User.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating User with id=" + id
      });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete User with id=" + id
      });
    });
};

// Delete all Users from the database.
exports.deleteAll = (req, res) => {
  User.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Users were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Users."
      });
    });
};

//
// Login
//
exports.authenticate = (req, res, next) => {
  authenticate(req.body.username, req.body.password).then(response => { 
    if (!response) {
      return res.status(403).send({msg: 'Username or password is incorrect'})
    } else {
      return res.send(response)
    }
  })
}

/*
const authenticate = (username, password, result) => {
  User.findAll({where: {username:  username }}).then(user => {
    console.log(user[0].validPassword(password));
      if (await user[0].validPassword(user[0].password, password)) {
      //if (user[0].password === password) {
        const token = jwt.sign({ id: user[0].id, account_type: user[0].account_type }, config.secret);
        const { password, ...userWithoutPassword } = user[0].dataValues;
        result(null,{
            ...userWithoutPassword,
            token
        });
    } else {
      result('Username or password is incorrect',null)
    }
  }).catch(err => {
    result('Username or password is incorrect', null);
  });
}
*/
const authenticate = (username, password) => {
  return new Promise((resolve, reject) => {
   try {
    User.findOne({
    where: {
     username: username // user email
    }
    }).then(async (response) => {
     if (!response) {
      resolve(false);
     } else {
       if (!response.dataValues.password || 
        !await response.validPassword(password.toString(), 
         response.dataValues.password)) {
          resolve(false);
       } else {
        const token = jwt.sign({ id: response.id, account_type: response.account_type }, config.secret);
        const { password, ...userWithoutPassword } = response.dataValues;
        resolve({
            ...userWithoutPassword,
            token
        });
       }
      }
     })
    } catch (error) {
    const response = {
     status: 500,
     data: {},
    error: {
     message: "user match failed"
    }
    };
   reject(response);
   }
  })
 }


//
// Register
//
exports.register = (req, res) => {
  this.create(req, res)
}
