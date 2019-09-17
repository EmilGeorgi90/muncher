var express = require('express');
var router = express.Router();
const controller = require('../controller')
const dbController = new controller.dbController();
/* GET home page. */
let login;
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/manageUrl', async function(req, res, next) {
  if(!login){
    res.redirect('login')
  }
  res.render('manageUrl', {url: await dbController.getDataManager(req, res, next)})
})
router.get('/seeData', async function(req, res, next) {
  res.render('seeData', {url: await dbController.getDataManager(req, res, next)})
})
router.get('/trainer', async function(req, res, next){
  console.log(await dbController.GetContentFromCrawler(req, res, next))
  res.render('trainer', {url: req.query.url, html: await dbController.GetContentFromCrawler(req, res, next)})
})
router.get('/login', function(req, res, next) {
  res.render('login');
})
router.post('/login', async function(req, res, next) {
  var loginCred = process.env.LOGIN.split(',')
  if(loginCred.includes(req.body.username + ':' + req.body.password)) {
    login = true;
    res.redirect('/manageUrl')
  } else {
    res.render("login", error = {error: "error on login"});
  }
})
router.get('/data', dbController.getData)
router.put('/updateUrl', dbController.updateUrl)
router.post('/data', dbController.PostData)
router.post('/addUrl', dbController.addUrl)
module.exports = router;
