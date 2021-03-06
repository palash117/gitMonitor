const Slimbot = require("slimbot");
const config = require("config");
const User = require("./User");
const request = require("request");
const Store = require("./Store");
const axios = require("axios");
const formatDateFromIsoString = require("./utils/DateFormat");

const slimbot = new Slimbot(config.get("id"));

var pause = false;

slimbot.on("message", (message) => {
  if (!checkForCommands(message)) {
    slimbot.sendMessage(message.chat.id, "hi, messageReceived");
  }
  console.log("message read");
  console.log(message);
});

const store = new Store();
store.retreive();

// add new listener for user
const addNewListenerForUser = ({ githubUserName, userId, name, chatId }) => {
  let user = store.userIdMap[userId];
  if (!user) {
    user = new User({ name, userId, chatId });
    store.userList.push(user);
    store.githubUserLastEvent[userId] = {};
    store.userIdMap[userId] = user;
  }
  let githubUserNames = store.listenerMap[user.userId];
  if (!githubUserNames) {
    githubUserNames = [];
    store.listenerMap[user.userId] = githubUserNames;
  }
  if (githubUserNames.indexOf(githubUserName) == -1) {
    githubUserNames.push(githubUserName);
    store.githubUserLastEvent[userId][githubUserName] = null;
  }
  store.save();
};

// remove listener for user
const removeListenerForUser = ({ githubUserName, userId }) => {
  if (!userId) {
    return "userid required";
  }
  if (!githubUserName) {
    return "git username required";
  }
  if (!store.userIdMap[userId] || !store.listenerMap[userId]) {
    return "you are not listening to updates for any git user";
  }
  githubUserNames = store.listenerMap[userId];
  if (githubUserNames.indexOf(githubUserName) == -1) {
    return `you are not listening for ${githubUserName}`;
  }
  store.listenerMap[userId] = githubUserNames.filter(
    (name) => name !== githubUserName
  );
  store.githubUserLastEvent[userId][githubUserName] = null;
  store.save();
  return `you are not listening to git updates for ${githubUserName}`;
};

// update to user
const updateUser = async ({ userId, githubUserName, updateMsg }) => {
  user = store.userIdMap[userId];
  if (!user) {
    console.error(`user not found for ${userId}`);
    return;
  }

  if (!updateMsg) {
    console.log(updateMsg, user);
  }

  chatId = user.chatId;
  slimbot.sendMessage(chatId, `hi ${user.name},${updateMsg}`);
};

// listen to updates
const listen = async () => {
  if (pause) {
    return;
  }
  for (userId in store.userIdMap) {
    let githubUserNames = store.listenerMap[userId];
    let user = store.userIdMap[userId];
    for (githubUserName of githubUserNames) {
      let lastEventIdMap = store.githubUserLastEvent[userId];
      let lastEventId = lastEventIdMap[githubUserName];
      let response = await axios.get(
        `https://api.github.com/users/${githubUserName}/events/public?client_id=${config.get(
          "githubClientId"
        )}&client_secret=${config.get("githubClientSecret")}`,
        {
          headers: { "user-agent": "node.js" },
        }
      );
      // data = JSON.parse(data);
      if (response.status != 200) {
        console.log("unsuccessful response for", githubUserName);
        continue;
      }
      let data = response.data;
      if (data && data.length > 0) {
        let currentEventId = data[0].id;
        if (lastEventId != currentEventId) {
          prepareAndSendMessage(data[0], githubUserName, userId);
          store.githubUserLastEvent[userId][githubUserName] = currentEventId;
        }
      }
    }
  }
  store.save();
};

var prepareAndSendMessage = async (payload, githubUserName, userId) => {
  let message = `update for ${githubUserName} in repo ${payload.repo.name}`;
  if (payload.payload.commits) {
    const commits = payload.payload.commits;
    message = `${message} ${commits
      .map((c) => `\ncommit: ${c.message},`)
      .reduce((a, b) => a + b, "")}`;
  }
  message = message + `\n on ${formatDateFromIsoString(payload.created_at)}`;
  chatId = store.userIdMap[userId].chatId;
  console.log("prepared message: ", message);
  updateUser({ userId, githubUserName, updateMsg: message });
};

var checkForCommands = (message) => {
  words = message.text
    .split(" ")
    .map((w) => w.trim())
    .map((w) => w.toLowerCase());
  if (words.length === 2) {
    firstWord = words[0];
    switch (firstWord) {
      case "listen":
        addNewListenerForUser({
          githubUserName: words[1],
          userId: message.from.id,
          name: message.from.first_name,
          chatId: message.chat.id,
        });
        return true;
      case "unlisten":
        removeListenerForUser({
          githubUserName: words[1],
          userId: message.from.id,
        });
        return true;
      case "pause":
        pause = true;
        return true;
      case "unpause":
        pause = false;
        return true;
      default:
        return false;
    }
  } else return false;
};

setInterval(listen, 1000 * 15);
slimbot.startPolling();
