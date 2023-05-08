<template>
  <div class="login-container">
    <div class="container2">
      <el-container>
        <el-header class="headerEl"
          ><div class="header-text">注&nbsp;册</div></el-header
        >
        <el-main class="mainbox">
          <div>
            <div class="loginbox">
              <div class="label">
                <div style="width: 10vw; padding-right: 1vw">用户账号:</div>
                <el-input
                  prefix-icon="el-icon-user"
                  class="input"
                  placeholder="请输入用户账号"
                  v-model="userNo"
                  clearable
                >
                </el-input>
              </div>
              <div class="label">
                <div style="width: 10vw">姓名:</div>
                <el-input
                  prefix-icon="el-icon-user"
                  class="input"
                  placeholder="请输入用户姓名"
                  v-model="userName"
                  clearable
                >
                </el-input>
              </div>
              <div class="label">
                <div style="width: 10vw; padding-right: 1vw">手机号码:</div>
                <el-input
                  prefix-icon="el-icon-user"
                  class="input"
                  placeholder="请输入用户手机"
                  v-model="phone"
                  clearable
                >
                </el-input>
              </div>
              <div class="label">
                <div style="width: 10vw">密码:</div>
                <el-input
                  prefix-icon="el-icon-lock"
                  class="input"
                  placeholder="请输入密码"
                  v-model="password"
                  show-password
                >
                </el-input>
              </div>
              <el-row>
                <div
                  :style="{
                    'padding-top': '2rem',
                    display: 'flex',
                    'justify-content': 'center',
                    'align-items': 'center',
                  }"
                >
                  <el-button type="primary" round @click="register()"
                    ><div v-if="!loading">注册</div>
                    <mt-spinner
                      v-else-if="loading"
                      type="triple-bounce"
                    ></mt-spinner
                  ></el-button>
                  <el-button type="default" round @click="gotoLogin()"
                    ><div>返回</div></el-button
                  >
                </div>
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
    let userName = "",
      password = "";
    return {
      userName,
      password,
      phone: "",
      userNo: "",
      loading: false,
    };
  },
  methods: {
    async register() {
      let res;
      this.loading = true;
      try {
        res = await this.$axios({
          method: "post",
          url: "/api/users/userRegister",
          data: {
            userName: this.userName,
            password: this.password,
            phone: this.phone,
            userNo: this.userNo,
          },
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        this.loading = false;
        MessageBox("提示", "无网络连接");
        return;
      }
      if (res.data.loginInfo) {
        this.loading = false;
        MessageBox("提示", res.data.loginInfo.msg);
        return;
      } else if (res.data.error) {
        this.loading = false;
        MessageBox("提示", res.data.error.msg);
      } else {
        this.loading = false;
        MessageBox("提示", "已成功注册，请点击下方返回键");
      }
    },
    gotoLogin() {
      this.$router.push({ path: "home" });
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
  align-content: left;
  text-align: left;
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

.label {
  display: inline-flex;
  justify-content: left;
  align-items: center;
}
</style>
<style>
input.el-input__inner {
  background-color: transparent !important;
}
</style>
