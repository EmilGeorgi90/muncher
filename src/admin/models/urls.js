'use strict';
module.exports = (sequelize, DataTypes) => {
  const urls = sequelize.define('urls', {
    url: DataTypes.STRING,
    last_crawl_at: DataTypes.DATE,
    orgname: DataTypes.STRING,
    selector: DataTypes.STRING,
    error_at: DataTypes.DATE
  }, {underscore: true});
  urls.associate = function(models) {
    urls.hasMany(models.logs)
  };
  return urls;
};