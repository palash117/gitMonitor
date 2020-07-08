const fs = require("fs");
class Store {
  constructor() {
    this.listenerMap = {};
    this.userIdMap = {};
    this.userList = [];
    this.githubUserLastEvent = {};
  }
  save = () => {
    fs.writeFileSync("storage.json", JSON.stringify(this));
  };
  retreive = () => {
    try {
      let data = fs.readFileSync("storage.json");

      if (data) {
        let store = JSON.parse(data);
        this.listenerMap = store.listenerMap;
        this.userIdMap = store.userIdMap;
        this.userList = store.userList;
        this.githubUserLastEvent = store.githubUserLastEvent;
      }
    } catch (error) {}
  };
}
module.exports = Store;
