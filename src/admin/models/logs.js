'use strict';
module.exports = (sequelize, DataTypes) => {
  const logs = sequelize.define('logs', {
    data: DataTypes.JSON,
    url_id: DataTypes.INTEGER
  }, {
    underscored: true
});
  logs.associate = function(models) {
    logs.belongsTo(models.urls)
  };
  return logs;
};