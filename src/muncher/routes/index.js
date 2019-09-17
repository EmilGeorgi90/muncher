const crmController = require('../controller'); 
class Routes {
  constructor() {
    this.contactController = new crmController.ContactController();
  }
 async routes(app) {
    app.get('/', await this.contactController.getCrawl);
    app.get('/crawl', await this.contactController.getCrawl);
    app.get('/parse', this.contactController.parse)
  }
}
exports.Routes = Routes;
