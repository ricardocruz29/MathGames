const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize);
db.ban = require("./ban.model.js")(sequelize, Sequelize);
db.friend = require("./friend.model.js")(sequelize, Sequelize);

db.ban.belongsTo(db.user, {through: "users",foreignKey: 'user_id', as: 'user'});
db.friend.belongsTo(db.user, {through: "users", foreignKey: 'friend1', as: 'friend_1'})
db.friend.belongsTo(db.user, {through: "users", foreignKey: 'friend2', as: 'friend_2'})

module.exports = db;