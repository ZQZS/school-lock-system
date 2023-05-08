import Vue from "vue";
import App from "./App.vue";
import MintUI from "mint-ui";
import "mint-ui/lib/style.css";
import router from "./router/index";
import VueCookies from "vue-cookies";
import { createPinia, PiniaVuePlugin } from "pinia";
import "babel-polyfill";
import axios from "axios";
import { basicSetting } from "stores/basicSettings";
Vue.config.productionTip = false;
Vue.use(VueCookies);
Vue.use(MintUI);
Vue.use(PiniaVuePlugin);
Vue.prototype.$axios = axios;

const pinia = createPinia();
new Vue({
  el: "#app",
  router,
  pinia,
  render: (h) => h(App),
  data: function () {
    const basicSet = basicSetting();
    async function getUserInfo(that) {
      if (basicSet.user.userNo == "") {
        if (that.$cookies.isKey("user_info")) {
          let user = that.$cookies.get("user_info");
          await basicSet.setUser({
            userName: user.user_name, //用户姓名
            userNo: user.user_no, //学工号
            phone: user.user_phone, //手机号码 可空
            hours: user.user_hour, //每月使用时间
          });
          that.$router.replace({ path: "./home" });
        } else {
          that.$router.replace({ path: "./login" });
        }
      }
    }
    getUserInfo(this);
    return {
      oldUrl: "",
    };
  },
  methods: {},
});
