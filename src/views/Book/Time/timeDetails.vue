<template>
  <div>
    <return-modle :title="title"></return-modle>
    <div style="padding-block-start: 3em">
      <mt-field
        :readonly="true"
        :disableClear="true"
        label="地点"
        placeholder="地点"
        v-model="placename"
      ></mt-field>
      <mt-field
        :readonly="true"
        :disableClear="true"
        label="地点介绍"
        placeholder="地点介绍"
        type="textarea"
        rows="4"
        v-model="introduction"
      ></mt-field>
      <mt-field :readonly="true" label="预约时间">{{ appointment }}</mt-field>
      <mt-field
        :readonly="true"
        label="申请人名字"
        :disableClear="true"
        placeholder="名字"
        v-model="applyerName"
      >
      </mt-field>
      <mt-field
        :readonly="true"
        label="申请人学工号"
        :disableClear="true"
        placeholder="工号"
        v-model="applyerNo"
      >
      </mt-field>
      <mt-field
        label="申请理由"
        placeholder="输入理由"
        type="text"
        v-model="applyerReason"
      ></mt-field>
      <mt-field
        :readonly="false"
        label="申请人手机"
        placeholder="请输入手机号"
        type="tel"
        v-model="phone"
      >
      </mt-field>
      <mt-cell></mt-cell>
      <mt-button size="large" type="primary" @click="order">确定预约</mt-button>

      <!--                            导航栏                                      -->
      <mtabbar
        @updateSelected="updateSelected"
        :selected="this.selected"
      ></mtabbar>
    </div>
  </div>
</template>

<script>
import { MessageBox } from "mint-ui";
import Mtabbar from "Components/Mtabbar.vue";
import ReturnModle from "Components/ReturnModle.vue";
import { basicSetting } from "stores/basicSettings";
export default {
  components: { Mtabbar, ReturnModle },
  data() {
    const basicSet = basicSetting();
    console.log(this.$route.query);
    return {
      //此几项需要获取-------------------------------
      appointment: this.$route.query.times.substr(8),
      placename: this.$route.query.info.place_name,
      introduction: this.$route.query.info.place_introduction,
      applyerName: basicSet.user.userName,
      applyerNo: basicSet.user.userNo,
      phone: basicSet.user.phone,
      //--------------------------------------------
      readonly: true,
      fixed: true,
      selected: "book",
      applyerReason: "",
      title: "按时间预约",
    };
  },
  methods: {
    updateSelected(e) {
      this.selected = e;
    },
    change(selected) {
      //导航栏切换
      console.log("ook");
      if (selected !== "book") {
        this.$router.push({ path: "home", query: { selected: this.selected } });
      }
    },
    getAppointment() {
      console.log(this.$router);
      return "1111";
    },
    order() {
      //确定预约按钮，需要发包操作
      if (this.phone == "" || this.phone.length != 11) {
        MessageBox("提示", "手机号码格式错误");
        return;
      }
      const that = this;
      MessageBox.confirm("确定执行此操作?")
        .then(async (action) => {
          if (action === "confirm") {
            let res = await that.$axios({
              method: "post",
              url: "/api/order/order",
              data: {
                place_id: that.$route.query.info.place_id,
                user_no: that.applyerNo,
                start: that.$route.query.start,
                end: that.$route.query.end,
                apply_reason: that.applyerReason,
              },
              headers: { "Content-Type": "application/json" },
            });
            console.log(res);
            if (res.data.error) {
              MessageBox("提示", res.data.error.msg);
              return;
            }
            if (res.data.loginInfo) {
              MessageBox.alert(res.data.loginInfo.msg);
              that.$router.replace({ path: "./login" });
              return;
            }
            MessageBox("提示", "成功添加");
            that.$router.replace({ path: "./home" });
          }
          console.log(action);
        })
        .catch((index) => {
          console.log(index);
        });
    },
  },
};
</script>

<style scoped></style>
