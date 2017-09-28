import { createStore, combineReducers } from 'redux';

export const ONLINE = "ONLINE";
export const AWAY = "AWAY";
export const BUSY = "BUSY";
export const OFFLINE = "OFFLINE";

export const UPDATE_STATUS = "UPDATE_STATUS";
export const CREATE_NEW_MESSAGE = "CREATE_NEW_MESSAGE";

const defaultState = {
  messages:[{
    date: new Date("2017-09-26 10:11:55"),
    postedBy: "Curly",
    content: "I <3 the new productivity app!"
  }, {
    date: new Date("2017-09-26 10:12:00"),
    postedBy: "Moe",
    content: "Do the chunk!"
  }, {
    date: new Date("2017-09-26 12:06:04"),
    postedBy: "Jim",
    content: "hnnnnnnggggg!"
  }],
  userStatus: ONLINE
};

const userStatusReducer = (state = defaultState.userStatus, {type,value}) => {
  switch(type) {
    case UPDATE_STATUS:
      return value;
      break;
  }
  return state;
}

const messagesReducer = (state = defaultState.messages, {type, value, postedBy, date}) => {
  switch(type) {
    case CREATE_NEW_MESSAGE:
      const newState = [{date, postedBy, content:value}, ... state]
      return newState;
  }
  return state;
}

const combinedReducer = combineReducers({
  userStatus: userStatusReducer,
  messages: messagesReducer
})

const store = createStore(combinedReducer);

document.forms.newMessage.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = e.target.newMessage.value;
  const username = localStorage["preferences"] ? JSON.parse(localStorage["preferences"]).userName : "Jim";
  store.dispatch(newMessageAction(value, username));
});

const render = () => {
  const { messages, userStatus } = store.getState();
  document.getElementById("messages").innerHTML = messages
    .sort((a,b) => b.date - a.date)
    .map(message => (`
        <div>
            ${message.postedBy} : ${message.content}
        </div>
    `)).join("");
  document.forms.newMessage.fields.disabled = (userStatus === OFFLINE);
  document.forms.newMessage.newMessage.value = "";
};

const statusUpdateAction = (value) => {
  return {
    type: UPDATE_STATUS,
    value
  }
};

const newMessageAction = (content, postedBy) => {
  const date = new Date();
  return {
    type: CREATE_NEW_MESSAGE,
    value: content,
    postedBy,
    date
  }
};

document.forms.selectStatus.status.addEventListener("change", (e) => {
  store.dispatch(statusUpdateAction(e.target.value));
});

render();

store.subscribe(render);