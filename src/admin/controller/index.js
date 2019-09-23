const db = require("../models");
var request = require("request");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
class dbController {
  checkLogin(postValues){
    var loginCred = process.env.LOGIN.split(',')
    if(loginCred.includes(postValues.username + ':' + postValues.password)) {
      return true;
    } else {
      return false;
    }
  }
  async PostData(req, res, next) {
    const url = await db.urls
      .findOne({ where: { url: req.query.url } })
      .then(data => {
        return data;
      });
    console.log(url);
    const SavingData = {
      data: JSON.stringify(req.body),
      url_id: url.id
    };
    const log = await db.logs.create(SavingData);
    url.update({ last_crawl_at: new Date() });
    res.send(log);
  }
  async getData(req, res, next) { 
    res.send(JSON.stringify(await db.urls.findAll({ include: [db.logs] })));
  }
  async getDataManager(req, res, next) {
    if (req.query.url) {
      return await db.urls.findAll({
        include: [db.logs],
        where: { url: req.query.url }
      });
    } else {
      const tempjson = {
        body: []
      };
      let result; 
      if (req.query.search) {
        result = await db.urls.findAll({
          include: [db.logs],
          where: { url: { [Op.substring]: req.query.search } }
        });
      } else {
        result = await db.urls.findAll({ include: [db.logs] });
      }
      result.forEach(element => {
        if (
          tempjson.body.find(
            data => data.baseurl === element.orgname
          ) === undefined
        ) {
          tempjson.body.push({
            id: element.id,
            baseurl: element.orgname,
            children: []
          });
          tempjson.body
            .find(data => data.baseurl === element.orgname)
            .children.push({ url: element });
        } else {
          tempjson.body
            .find(data => data.baseurl === element.orgname)
            .children.push({ url: element });
        }
      });
      return tempjson;
    }
  }

  async addUrl(req, res, next) {
    console.log(req.query.url);
    const savingUrl = {
      orgname: req.query.orgname,
      url: req.query.url,
      selector: req.query.selector.substring(0,1) == '.' ? req.query.selector : '#' + req.query.selector,
      last_crawl_at: new Date().setDate(new Date().getDate() -1),
      error_at: null
    };
    const url = await db.urls.create(savingUrl);
    console.log(url)
    res.send(url);
  }
  async updateUrl(req, res, next) {
    const urledit = await db.urls.findOne({ where: { id: req.query.id } });
    const url = await urledit.update({ url: req.query.url });
    res.send(url);
  }
  async GetContentFromCrawler(req, res, next) {
    // shell.exec("aws ec2 run-instances --image-id ami-xxxxxxxx --count 1 --instance-type t2.micro --key-name MyKeyPair --security-group-ids sg-903004f8 --subnet-id subnet-6e7f829e", function(code, stdout, stderr) { 
    //   console.log('exit code:', code)
    //   console.log('Program output', code)
    //   console.log('Program stderr', code)
    // })
    let html = "";
    request(
      `${process.env.MUNCHER_API}/crawl?url=${
        req.query.url
      }&isHtmlResponse=true`,
      (error, response, body) => {
        if (!error && response.statusCode < 400) {
          html = body;
        } else {
          return error;
        }
      }
    );
    return html;
  }
}
exports.dbController = dbController;
