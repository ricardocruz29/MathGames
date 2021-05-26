const db = require("../models");
const User = db.user;
const UserRanks = db.user_ranks;
const AvatarItems = db.avatar_items;
const Op = db.Sequelize.Op;
const config = require("../config/auth.config")
var jwt = require("jsonwebtoken");

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: users } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, users, totalPages, currentPage };
};



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
      UserRanks.create({user_id: data.id})
      .then( response => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the UserRanks."
        });
      });
      
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    });
};

// Retrieve all Users from the database.
exports.findAllBanned = (req, res) => {
  if (typeof req.query.orderby !== "undefined") {
    const { page, size } = req.query;
    const username = !req.query.username ? "": req.query.username+"%";
    const { limit, offset } = getPagination(page, size);
    User.findAndCountAll({attributes: ['id', 'username', 'account_level', 'account_type', 
                                       'avatar_color', 'avatar_hat', 'avatar_shirt', 'avatar_accessorie', 
                                       'avatar_trouser', 'banned'] , 
                          where: {username: { [Op.like]: `%${username}` }, banned: true }, 
                          order: [[req.query.orderby, 'DESC']], limit, offset})
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Users."
      });
    });
  } else {
    User.findAll({attributes: ['username', 'account_level', 'account_type', 
                               'avatar_color', 'avatar_hat', 'avatar_shirt', 'avatar_accessorie', 
                               'avatar_trouser', 'banned'],
                  where: {banned: true}})
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

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  if (typeof req.query.orderby !== "undefined") {
    const { page, size } = req.query;
    const username = !req.query.username ? "": req.query.username+"%";
    const { limit, offset } = getPagination(page, size);
    User.findAndCountAll({attributes: ['id', 'username', 'account_level', 'account_type', 
                                        'avatar_color', 'avatar_hat', 'avatar_shirt', 'avatar_accessorie', 
                                        'avatar_trouser'] , 
                          where: {username: { [Op.like]: `%${username}` }, banned: false }, 
                          order: [[req.query.orderby, 'DESC']], limit, offset})
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Users."
      });
    });
  } else {
    User.findAll({attributes: ['username', 'account_level', 'account_type', 
                                'avatar_color', 'avatar_hat', 'avatar_shirt', 'avatar_accessorie', 
                                'avatar_trouser'],
                  where: {banned: false}})
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
      const { password, ...userWithoutPassword } = data.dataValues;
      res.send(userWithoutPassword);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with id=" + id
      });
    });
};

// Update a User by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  if (parseInt(req.userId) !== parseInt(id)) {
    res.status(403).send({
      message: "Unauthorized!"
    });
    return;
  }

  const { account_type, banned, ...userWithoutAccount_Type } = req.body;

  var level = await User.findByPk(id);
  level = level.dataValues.account_level;

  if (userWithoutAccount_Type.avatar_hat !== "none") {
    var avatar_hat = await AvatarItems.findOne({where: {name: userWithoutAccount_Type.avatar_hat, category: "Hat"}});
    if (avatar_hat) {
      if (level < avatar_hat.dataValues.level) {
        res.status(500).send({
          message: "The specific Avatar Hat is not allowed"
        });
        return;
      }
    } else {
      res.status(500).send({
        message: "The specific Avatar Hat does not exist"
      });
      return;
    }
  }
  /*
  console.log(userWithoutAccount_Type.avatar_trouser)
  if (userWithoutAccount_Type.avatar_trouser !== "none") {
    var avatar_trouser = await AvatarItems.findOne({where: {name: userWithoutAccount_Type.avatar_trouser, category: "Trouser"}});
    if (avatar_trouser) {
      if (level < avatar_trouser.dataValues.level) {
        res.status(500).send({
          message: "The specific Avatar Trouser is not allowed"
        });
        return;
      }
    } else {
      res.status(500).send({
        message: "The specific Avatar Trouser does not exist"
      });
      return;
    }
  }
  */
  if (userWithoutAccount_Type.avatar_accessorie !== "none") {
    var avatar_accessorie = await AvatarItems.findOne({where: {name: userWithoutAccount_Type.avatar_accessorie, category: "Accessorie"}});
    if (avatar_accessorie) {
      if (level < avatar_accessorie.dataValues.level) {
        res.status(500).send({
          message: "The specific Avatar Accessorie is not allowed"
        });
        return;
      }
    } else {
      res.status(500).send({
        message: "The specific Avatar Accessorie does not exist"
      });
      return;
    }
  }

  if (userWithoutAccount_Type.avatar_shirt !== "none") {
    var avatar_shirt = await AvatarItems.findOne({where: {name: userWithoutAccount_Type.avatar_shirt, category: "Shirt"}});
    if (avatar_shirt) {
      if (level < avatar_shirt.dataValues.level) {
        res.status(500).send({
          message: "The specific Avatar Shirt is not allowed"
        });
        return;
      }
    } else {
      res.status(500).send({
        message: "The specific Avatar Shirt does not exist"
      });
      return;
    }
  }

  User.update(userWithoutAccount_Type, {
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

// Upgrade a User_account_type by the id in the request
exports.upgrade_account = (req, res) => {
  const id = req.params.id;
  var new_type;
  User.findByPk(id).then(account => {
    if (account.account_type === "U")
      new_type = "T"
    if (account.account_type === "T")
      new_type = "A"
    if (account.account_type === "A")
      new_type = "A"

    User.update( {account_type: new_type}, {
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
    .catch(err1 => {
      res.status(500).send({
        message: "Error upgrading User with id=" + id
      });
    });
  }).catch(err2 => {
    res.status(500).send({
      message: "Error upgrading User with id=" + id
    });
  });


};

// Upgrade a User_account_type by the id in the request
exports.downgrade_account = (req, res) => {
  const id = req.params.id;
  var new_type;
  User.findByPk(id).then(account => {
    if (account.account_type === "U")
      new_type = "U"
    if (account.account_type === "T")
      new_type = "U"
    if (account.account_type === "A")
      new_type = "T"

    User.update( {account_type: new_type}, {
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
    .catch(err1 => {
      res.status(500).send({
        message: "Error upgrading User with id=" + id
      });
    });
  }).catch(err2 => {
    res.status(500).send({
      message: "Error upgrading User with id=" + id
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
      console.log(err)
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
      if (response["banned"])
        return res.status(403).send({msg: 'This account is banned'})
      else  {
        const { banned, ...userWithoutBanned } = response;
        return res.send(userWithoutBanned)
      }
    }
  })
}

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
        const token = jwt.sign({ id: response.id, account_type: response.account_type }, config.secret, {expiresIn: 86400});
        const { password, ...userWithoutPassword } = response.dataValues;
        UserRanks.findOne({
          where: { user_id: userWithoutPassword.id}
        }).then(userRanksReponse => {
          const userRanksData = userRanksReponse.dataValues;
          resolve({
            ...userWithoutPassword,
            token,
            userRanksData
        });
        })
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






// Retrieve statistics
exports.statistics = (req, res) => {
  var response = [0, 0, 0, 0, 0, 0, 0]
  var date = new Date();
  var last = new Date(date.getTime() - (6 * 24 * 60 * 60 * 1000));
  var dd = last.getDate();
  var mm = last.getMonth()+1;
  var yyyy = last.getFullYear();
  var setimoDia = new Date(yyyy + '-' + mm + '-' + dd);
  setimoDia.setTime( setimoDia.getTime() - new Date().getTimezoneOffset()*60*1000 );
  setimoDia = setimoDia.toISOString().slice(0, 19).replace('T', ' ');
  setimoDia = setimoDia.split(" ")[0]

  var sextoDia = new Date(yyyy + '-' + mm + '-' + (dd+1));
  sextoDia.setTime( sextoDia.getTime() - new Date().getTimezoneOffset()*60*1000 );
  sextoDia = sextoDia.toISOString().slice(0, 19).replace('T', ' ');
  sextoDia = sextoDia.split(" ")[0]

  var quintoDia = new Date(yyyy + '-' + mm + '-' + (dd+2));
  quintoDia.setTime( quintoDia.getTime() - new Date().getTimezoneOffset()*60*1000 );
  quintoDia = quintoDia.toISOString().slice(0, 19).replace('T', ' ');
  quintoDia = quintoDia.split(" ")[0]

  var quartoDia = new Date(yyyy + '-' + mm + '-' + (dd+3));
  quartoDia.setTime( quartoDia.getTime() - new Date().getTimezoneOffset()*60*1000 );
  quartoDia = quartoDia.toISOString().slice(0, 19).replace('T', ' ');
  quartoDia = quartoDia.split(" ")[0]

  var terceiroDia = new Date(yyyy + '-' + mm + '-' + (dd+4));
  terceiroDia.setTime( terceiroDia.getTime() - new Date().getTimezoneOffset()*60*1000 );
  terceiroDia = terceiroDia.toISOString().slice(0, 19).replace('T', ' ');
  terceiroDia = terceiroDia.split(" ")[0]

  var segundoDia = new Date(yyyy + '-' + mm + '-' + (dd+5));
  segundoDia.setTime( segundoDia.getTime() - new Date().getTimezoneOffset()*60*1000 );
  segundoDia = segundoDia.toISOString().slice(0, 19).replace('T', ' ');
  segundoDia = segundoDia.split(" ")[0]

  var primeiroDia = new Date(yyyy + '-' + mm + '-' + (dd+6));
  primeiroDia.setTime( primeiroDia.getTime() - new Date().getTimezoneOffset()*60*1000 );
  primeiroDia = primeiroDia.toISOString().slice(0, 19).replace('T', ' ');
  primeiroDia = primeiroDia.split(" ")[0]

  User.findAll({where: { createdAt: {[Op.gte]: setimoDia} }})
    .then(data => {
      for (var element of data) {
        if (element.createdAt.split(" ")[0] === setimoDia)
          response[0] = response[0] + 1
        else if (element.createdAt.split(" ")[0] === sextoDia)
          response[1] = response[1] + 1
        else if (element.createdAt.split(" ")[0] === quintoDia)
          response[2] = response[2] + 1
        else if (element.createdAt.split(" ")[0] === quartoDia)
          response[3] = response[3] + 1
        else if (element.createdAt.split(" ")[0] === terceiroDia)
          response[4] = response[4] + 1
        else if (element.createdAt.split(" ")[0] === segundoDia)
          response[5] = response[5] + 1
        else if (element.createdAt.split(" ")[0] === primeiroDia)
          response[6] = response[6] + 1
      }
      res.send(response); 
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Bans."
      });
    });
}