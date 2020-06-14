<template>
  <div id="app">
    <div
      style="margin: auto;
      width: 500px; padding-top: 100px"
    >
      <div v-if="!ready">
        <h4 style="color:#668cff;text-align: center;">
          JOIN TO CHAT WITH YOUR FRIENDS
        </h4>
        <p style="text-align: center;">
          There are {{ connections }} connections
        </p>
        <el-form :inline="true" @submit.prevent.native="addUser">
          <el-input
            v-model="username"
            placeholder="Enter your name here..."
            style="width:400px; float: left;"
          />

          <el-button
            style="padding: 10px; width:95px; height: 40px"
            type="success"
            @click="addUser"
            >Join</el-button
          >
          <p v-if="userError" style="color: red; float: left">
            Please enter your name
          </p>
        </el-form>
      </div>
      <h2 style="color:#668cff;text-align: center;" v-else>
        Wellcome {{ username }} to HALU chat app
      </h2>
      <div v-if="ready">
        <h4>You are chatting with {{ connections }} people!</h4>
        <p v-for="(user, idx) in userHistory" :key="idx">
          {{ user.username }} {{ user.type }}
        </p>
        <div
          style="border: 3px solid #c2d6d6 ; border-radius: 10px;  padding: 20px;     display: flex;
            flex-direction: column; height: 400px;    overflow: scroll;"
        >
          <ul style="padding: unset">
            <li
              v-for="(message, idx) in messages"
              :key="idx"
              style="list-style:none; display: inline-block; width: 100%; margin:5px;"
            >
              <p
                v-if="message.type === 1"
                style="float: left;
                    margin: 0 40px 5px 0 ;
                    text-align: justify;
              padding: 5px;"
              >
                <span
                  style=" background-color:#b3ccff;   padding: 5px;
                border-radius: 5px;"
                >
                  {{ message.message }}
                </span>
                <small>from {{ message.user }}</small>
              </p>
              <p
                v-else
                style="float: right;      text-align: justify;   margin: 0 0 5px 40px;"
              >
                <span
                  style="background-color: #ffb3cc;   padding: 5px;
                border-radius: 5px;"
                >
                  {{ message.message }}
                </span>
              </p>
            </li>
          </ul>
        </div>
      </div>
      <div v-if="ready" class="card-body">
        <el-form :inline="true" @submit.prevent.native="send">
          <p
            v-if="typing"
            style="background-color: rgb(102, 140, 255); margin:5px; padding:5px; border-radius:5px; display: inline-block; float: left"
          >
            <small v-for="(typingUser, idx) in typingList" :key="idx"
              >{{ typingUser }}
              <small
                v-if="
                  typingList.length !== 1 &&
                    typingUser !== typingList[typingList.length - 1]
                "
                >,
              </small>
            </small>
            <small v-if="typingList.length === 1">is </small>
            <small v-else> are</small>
            <small>typing...</small>
          </p>
          <p>
            <el-input
              v-model="newMessage"
              placeholder="Enter message..."
              style="width:400px; float: left;"
            />
            <el-button
              type="success"
              @click.prevent="send"
              style="width:95px; height:40px; float: right; padding: 10px; "
              >Send</el-button
            >
          </p>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";

var socket = io.connect("http://localhost:4000").emit("error");

export default {
  name: "ChatComp",

  data: () => ({
    newMessage: null,
    messages: [],
    typing: false,
    typingList: [],
    username: null,
    userError: false,
    ready: false,
    connections: 0,
    userHistory: []
  }),

  // Created Hook: In Vue.js, the created hook is called when the Vue.js COMPONENT HAS LOADED.
  // So, this a good place to listen to all our events from the server
  created() {
    window.onbeforeunload = () => {
      socket.emit("leave", this.username);
    };

    socket.on("chat-message", data => {
      this.messages.push({
        message: data.message,
        type: 1,
        user: data.user
      });
    });

    socket.on("typing", data => {
      this.typing = data;
      if (!this.typingList.includes(data)) this.typingList.push(data);
    });

    socket.on("stopTyping", data => {
      this.typingList = this.typingList.filter(name => name !== data);
      if (this.typingList.length === 0) {
        this.typing = false;
      }
    });

    socket.on("joined", data => {
      this.userHistory.push({
        username: data,
        type: "joined"
      });

      setTimeout(() => {
        this.userHistory = [];
      }, 5000);
    });

    socket.on("leave", data => {
      this.userHistory.push({
        username: data,
        type: "left"
      });

      setTimeout(() => {
        this.userHistory = [];
      }, 5000);
    });

    socket.on("connections", data => {
      this.connections = data;
    });
  },

  // Watch hook: The watch hook is a very interesting one, it can do a lot
  // but we used it to listen to changes on the message box and emit a typing event which is being broadcast back to other clients by the server.
  watch: {
    newMessage(value) {
      value
        ? socket.emit("typing", this.username)
        : socket.emit("stopTyping", this.username);
    }
  },

  methods: {
    send() {
      if (this.newMessage) {
        this.messages.push({
          message: this.newMessage,
          type: 0,
          user: "Me"
        });

        socket.emit("chat-message", {
          message: this.newMessage,
          user: this.username
        });

        this.newMessage = null;
      }
    },

    addUser() {
      if (this.username) {
        this.ready = true;
        socket.emit("joined", this.username);
      } else {
        this.userError = true;
      }
    }
  },

  beforeDestroy: () => {
    console.log("============", this.messages);

    const dataStoraged = {
      messages: this.messages,
      typing: this.typing,
      typingList: this.typingList,
      username: this.username,
      userError: this.userError,
      ready: this.ready,
      connections: this.connections,
      userHistory: this.userHistory
    };
    window.localStorage.setItem("dataStoraged", JSON.stringify(dataStoraged));
  }
};
</script>
