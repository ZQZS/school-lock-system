<template>
  <div class="login-container">
    <div class="container2">
      <el-container>
        <el-header class="headerEl"
          ><div class="header-text">登&nbsp;录</div></el-header
        >
        <el-main class="mainbox">
          <div>
            <div class="loginbox">
              <el-input
                prefix-icon="el-icon-user"
                class="input"
                placeholder="请输入用户名"
                v-model="username"
                clearable
              >
              </el-input>
              <el-input
                prefix-icon="el-icon-lock"
                class="input"
                placeholder="请输入密码"
                v-model="password"
                show-password
              >
              </el-input>
              <div class="switch">
                <el-switch
                  size="large"
                  v-model="checked"
                  active-text="记住密码"
                ></el-switch>
              </div>
              <el-row class="input">
                <el-button color="#778ca3" round @click="register()"
                  ><div v-if="!loading" style="width: 8vw">注册</div>
                  <mt-spinner
                    v-else-if="loading"
                    type="triple-bounce"
                  ></mt-spinner
                ></el-button>
                <el-button type="primary" round @click="login()"
                  ><div v-if="!loading" style="width: 8vw">登录</div>
                  <mt-spinner
                    v-else-if="loading"
                    type="triple-bounce"
                  ></mt-spinner
                ></el-button>
              </el-row>
            </div>
          </div>
        </el-main>
      </el-container>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { basicSetting } from "stores/basicSettings";
import {
  Container,
  Row,
  Main,
  Header,
  Input,
  Button,
  Switch,
} from "element-ui";
import { MessageBox } from "mint-ui";
Vue.use(Main);
Vue.use(Container);
Vue.use(Input);
Vue.use(Button);
Vue.use(Row);
Vue.use(Header);
Vue.use(Switch);
export default {
  data() {
    let username = "",
      password = "",
      checked = false;
    if (this.$cookies.isKey("user_info")) {
      this.$cookies.remove("user_info");
    }
    if (this.$cookies.isKey("user")) {
      const user = this.$cookies.get("user");
      username = user.username;
      password = user.password;
      checked = true;
    }
    return {
      username,
      password,
      checked,
      loading: false,
    };
  },
  beforeMount: async function () {
    if (this.$cookies.isKey("user")) {
      const user = this.$cookies.get("user");
      this.username = user.username;
      this.password = user.password;
      this.checked = true;
    }
  },
  methods: {
    async register() {
      let res;
      try {
        res = await this.$axios({
          method: "get",
          url: "/api/users/isRegisterOpen",
        });
      } catch (error) {
        console.log(error);
        MessageBox("提示", "无网络连接");
        return;
      }
      if (res.data.data.is_register_open !== 1)
        MessageBox("提示", "没有开启注册功能，如有需要请联系管理员开启");
      else this.$router.push({ path: "Register" });
    },
    async login() {
      let res;
      //带查询参数，变成 /register?plan=private
      const basicSet = basicSetting();
      // console.log("code:", this.$router.currentRoute.query);
      // console.log("state:", this.getQueryVariable("state"));
      // console.log(basicSet);
      this.loading = true;
      try {
        res = await this.$axios({
          method: "post",
          url: "/api/users/login",
          data: {
            userName: this.username,
            password: this.password,
          },
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        this.loading = false;
        MessageBox("提示", "无网络连接");
        return;
      }
      if (res.data.loginInfo.msg !== "success") {
        this.loading = false;
        MessageBox("提示", res.data.loginInfo.msg);
        return;
      }
      const resData = res.data.loginInfo.data;
      await basicSet.setUser({
        userName: resData.user_name, //用户姓名
        userNo: resData.user_no, //学工号
        phone: resData.user_phone, //手机号码 可空
        hours: resData.user_hour, //每月使用时间
      });
      this.loading = false;
      this.$cookies.set("user_info", resData, "7D");
      if (this.checked) {
        this.$cookies.set(
          "user",
          { username: this.username, password: this.password },
          "7D"
        );
      } else {
        if (this.$cookies.isKey("user")) {
          this.$cookies.remove("user");
        }
      }
      // return this.$router.push({ path: "home", query: { plan: "private" } });
      return this.$router.push({ path: "home" });
    },
    getQueryVariable(variable) {
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
          return pair[1];
        }
      }
      return false;
    },
  },
};
</script>
<style scoped>
.loginbox {
  align-content: center;
  text-align: center;
  margin: auto;
}

.mainbox {
  align-content: center;
  text-align: center;
}

.switch {
  padding-top: 1vh;
  width: 100%;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
}

.input {
  margin-top: 1vh;
}
.login-container {
  min-height: 95vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.header-text {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  text-align: center;
  font-size: 2.5rem;
  line-height: 1;
  font-weight: 500;
  letter-spacing: 0.1em;
}
.headerEl {
  filter: drop-shadow(0 20px 13px rgb(0 0 0 / 0.03))
    drop-shadow(0 8px 5px rgb(0 0 0 / 0.08));
}
.container2 {
  width: 80vw;
}
</style>
<style>
input.el-input__inner {
  background-color: transparent !important;
}
</style>
