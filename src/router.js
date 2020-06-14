import Vue from "vue";
import Router from "vue-router";
import Chat from "./components/Chat/index.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "chat",
      component: Chat
    }
  ]
});
