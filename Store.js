const fs = require("fs");
class Store {
  constructor() {
    this.listenerMap = {};
    this.userIdMap = {};
    this.userList = [];
    this.githubUserLastEvent = {};
  }
  save = () => {
    fs.writeFileSync(
      process.env.STORAGE_ENV + "/storage.json",
      JSON.stringify(this)
    );
  };
  retreive = () => {
    console.log("retreiving data");
    try {
      let data = fs.readFileSync(process.env.STORAGE_ENV + "storage.json");

      if (data) {
        let store = JSON.parse(data);
        this.listenerMap = store.listenerMap;
        this.userIdMap = store.userIdMap;
        this.userList = store.userList;
        this.githubUserLastEvent = store.githubUserLastEvent;
      }
    } catch (error) {
      console.log(error);
    }
  };
}
module.exports = Store;
