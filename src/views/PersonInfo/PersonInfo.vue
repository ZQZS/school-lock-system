<template>
  <div>
    <return-modle :title="title"></return-modle>
    <div style="padding-block-start: 3em">
      <mt-tab-container v-model="selected">
        <mt-tab-container-item class="bookButton" id="mine">
          <mt-field
            label="姓名"
            :readonly="true"
            placeholder="姓名"
            v-model="userName"
          ></mt-field>
          <mt-field
            label="学工号"
            :readonly="true"
            placeholder="学工号"
            v-model="userNo"
          ></mt-field>
          <mt-field
            label="此月剩余时间(小时)"
            :readonly="true"
            placeholder="时间"
            type="number"
            v-model="hours"
          ></mt-field>
          <mt-field
            label="手机号"
            placeholder="请输入手机号"
            type="tel"
            v-model="phone"
          ></mt-field>
          <mt-field
            label="旧密码"
            placeholder="请输入旧密码"
            type="password"
            v-model="oldPassword"
          ></mt-field>
          <mt-field
            label="新密码"
            placeholder="请输入新密码"
            v-model="user_password"
          ></mt-field>
          <mt-field
            label="确认新密码"
            placeholder="请输入新密码"
            v-model="user_password2"
          ></mt-field>
          <mt-cell></mt-cell>
        </mt-tab-container-item>
      </mt-tab-container>
      <mt-button size="large" type="primary" @click="order">保存</mt-button>

      <!--                            导航栏                                      -->
      <mtabbar
        @updateSelected="updateSelected"
        :selected="this.selected"
      ></mtabbar>
    </div>
  </div>
</template>

<script>
import Mtabbar from "Components/Mtabbar.vue";
import ReturnModle from "Components/ReturnModle.vue";
import { basicSetting } from "stores/basicSettings";
import { MessageBox } from "mint-ui";
export default {
  components: { Mtabbar, ReturnModle },
  data() {
    const basicSet = basicSetting();
    return {
      fixed: true,
      selected: "mine",
      userName: basicSet.user.userName,
      userNo: basicSet.user.userNo,
      phone: basicSet.user.phone,
      hours: basicSet.user.hours,
      title: "个人信息",
      oldPassword: "",
      user_password: "",
      user_password2: "",
    };
  },
  beforeMount: async function () {
    let res = await this.$axios({
      method: "get",
      url: "/api/users/getUserHours",
      headers: { "Content-Type": "application/json" },
    });
    if (res.data.data.hours > -1) {
      const basicSet = basicSetting();
      basicSet.updateUserHours(res.data.data.hours);
      this.hours = res.data.data.hours;
    }
    if (res.data.loginInfo) {
      MessageBox.alert(res.data.loginInfo.msg);
      this.$router.replace({ path: "./login" });
      return;
    }
  },
  methods: {
    updateSelected(e) {
      this.selected = e;
    },
    order() {
      //确定预约按钮，需要发包操作
      if (this.phone == "" || this.phone.length != 11) {
        MessageBox("提示", "手机号码格式错误");
        return;
      }
      if (this.user_password != this.user_password2) {
        MessageBox("提示", "两次新密码不相同");
        return;
      }
      if (this.user_password.length < 6 && this.user_password.length > 0) {
        MessageBox("提示", "密码长度需大于等于6位");
        return;
      }
      MessageBox.confirm("确定执行此操作?")
        .then(async (action) => {
          const basicSet = basicSetting();
          let res = await this.$axios({
            method: "post",
            url: "/api/users/updataPersonInfo",
            data: {
              user_phone: this.phone,
              user_password: this.user_password,
              oldPassword: this.oldPassword,
            },
            headers: { "Content-Type": "application/json" },
          });
          if (res.data.loginInfo) {
            MessageBox.alert(res.data.loginInfo.msg);
            this.$router.replace({ path: "./login" });
            return;
          } else if (res.data.error) {
            MessageBox("提示", res.data.error.msg);
          } else {
            MessageBox("提示", "保存成功");
            basicSet.user.phone = this.phone;
          }
        })
        .catch((index) => {
          console.log(index);
        });
    },
  },
};
</script>

<style scoped>
.bookButton {
  /* align-content:center;
    align-items: center;
    text-align: center; */
  min-height: 9vh;
}
</style>
