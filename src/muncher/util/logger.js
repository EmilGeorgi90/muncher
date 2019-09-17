const fs = require("fs");
path = require('path')
class logger {
    constructor(){

    }
  LogToStatus(message, pathToLogIn) {
    if (!fs.existsSync(path.join(pathToLogIn, "status.txt"))) {
      fs.writeFileSync(
        `${path.join(pathToLogIn, "status.txt")}`,
        `${new Date()} ${message}`
      );
    } else {
      fs.writeFileSync(
        `${path.join(pathToLogIn, "status.txt")}`,
        `${new Date()} ${message}`
      );
    }
  }
}
exports.logger = logger