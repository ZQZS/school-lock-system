<template>
  <div>
    <return-modle :title="title"></return-modle>
    <div style="padding-block-start: 3em">
      <!--wait / process / finish / error / success-->
      <el-steps
        :active="active == 4 ? 2 : active"
        :finish-status="active == 4 ? 'error' : 'success'"
        align-center
        style="margin-top: 20px"
      >
        <el-step :title="active == 0 ? '已撤销' : '申请'"></el-step>
        <el-step
          :title="active == 1 ? '正在审核' : active == 4 ? '已驳回' : '审核'"
        ></el-step>
        <el-step :title="active == 2 ? '发放密码' : '完成'"></el-step>
      </el-steps>

      <mt-field
        readonly
        label="地点"
        placeholder="地点"
        v-model="place_label"
      ></mt-field>
      <mt-field readonly label="预约时间" v-model="orderTime"></mt-field>
      <mt-field
        readonly
        label="申请人名字"
        :disableClear="true"
        placeholder="名字"
        v-model="userName"
      >
      </mt-field>
      <mt-field
        readonly
        label="申请人学工号"
        :disableClear="true"
        placeholder="工号"
        v-model="userNo"
      >
      </mt-field>
      <mt-field
        readonly
        label="申请理由"
        placeholder="输入理由"
        type="text"
        v-model="order_apply_reason"
      ></mt-field>
      <mt-field
        readonly
        label="申请人手机"
        placeholder="请输入手机号"
        type="tel"
        v-model="phone"
      >
      </mt-field>
      <mt-field
        readonly
        label="审批人"
        :disableClear="true"
        placeholder=""
        v-model="order_rejecter"
      ></mt-field>
      <mt-field
        label="审批理由"
        placeholder=""
        readonly
        type="text"
        v-model="order_reject_reason"
      ></mt-field>
      <mt-button
        :class="{ disButton: isTime }"
        :style="
          active == 0 ? 'display:none' : active >= 4 ? 'display:none' : ''
        "
        size="large"
        type="danger"
        @click="order"
        >撤销</mt-button
      >

      <!--                            导航栏                                      -->
      <mtabbar
        @updateSelected="updateSelected"
        :selected="this.selected"
      ></mtabbar>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Mtabbar from "Components/Mtabbar.vue";
import ReturnModle from "Components/ReturnModle.vue";
import { basicSetting } from "stores/basicSettings";
import { MessageBox } from "mint-ui";
import { Steps, Step } from "element-ui";
Vue.use(Steps);
Vue.use(Step);
export default {
  components: { Mtabbar, ReturnModle },
  data() {
    const basicSet = basicSetting();

    return {
      fixed: true,
      selected: "check",
      title: "预约信息",
      active: 0,
      place_id: "",
      order_id: "", //预约单号
      place_label: "", //地点名
      orderTime: "", //预约的时间段
      order_place_password: "", //门锁密码,状态：'审核中'、'已驳回'、'已过期'密码为空字符串即可
      state: 0, //预约状态，目前暂定'已撤销':0, '审核中':1，'已通过':3，'已驳回':4，'已过期':5  五种状态
      userName: basicSet.user.userName, //用户姓名
      userNo: basicSet.user.userNo, //学工号
      phone: basicSet.user.phone, //申请人电话
      order_apply_reason: "", //申请理由
      order_reject_reason: "", //驳回理由
      order_rejecter: "", //驳回人
      usedTime: "",
      isTime: true,
    };
  },
  beforeMount: async function () {
    let res = await this.$axios({
      method: "post",
      url: "/api/order/getOrderDetail",
      data: { order_id: this.$route.query.order_id },
      headers: { "Content-Type": "application/json" },
    });
    console.log(res);
    if (res.data.loginInfo) {
      MessageBox.alert(res.data.loginInfo.msg);
      this.$router.replace({ path: "./login" });
      return;
    }
    let element = res.data.data;
    let start = new Date(),
      end = new Date();
    start.setTime(element.order_time_start);
    end.setTime(element.order_time_end);
    let orderTime = `${start.getFullYear()}/${
      start.getMonth() - 0 + 1
    }/${start.getDate()} ${start.getHours()}:${start
      .getMinutes()
      .toString()
      .padStart(2, "0")}-${end.getHours()}:${end
      .getMinutes()
      .toString()
      .padStart(2, "0")} `;
    this.orderTime = orderTime;
    this.active = element.order_state;
    this.state = element.order_state;
    this.place_label = element.place_label;
    this.order_apply_reason = element.order_apply_reason;
    this.order_reject_reason = element.order_reject_reason;
    this.order_rejecter = element.order_rejecter;
    this.order_id = element.order_id;
    this.place_id = element.order_place_id;
    this.usedTime =
      parseInt(element.order_time_end - element.order_time_start) /
      1000 /
      60 /
      60;
    const d = new Date();
    this.isTime =
      parseInt(element.order_time_start - d.getTime()) / 1000 / 60 / 60 > 0.5
        ? false
        : true;
  },
  methods: {
    updateSelected(e) {
      this.selected = e;
    },

    order() {
      //确定撤销按钮，需要发包操作
      MessageBox.confirm("确定执行此操作?")
        .then(async (action) => {
          let res = null;
          try {
            res = await this.$axios({
              method: "post",
              url: "/api/order/recallOrder",
              data: {
                order_id: this.order_id,
                place_id: this.place_id,
                used_time: this.usedTime,
              },
              headers: { "Content-Type": "application/json" },
            });
          } catch (error) {
            console.log(error);
            MessageBox("提示", "无网络连接");
            return;
          }
          if (res.data.loginInfo) {
            MessageBox("提示", res.data.loginInfo.msg);
            return;
          } else if (res.data.error) {
            MessageBox("提示", res.data.error.msg);
          } else {
            MessageBox("提示", "撤回成功");
            let res = await this.$axios({
              method: "post",
              url: "/api/order/getOrderDetail",
              data: { order_id: this.$route.query.order_id },
              headers: { "Content-Type": "application/json" },
            });
            console.log(res);
            if (res.data.loginInfo) {
              MessageBox.alert(res.data.loginInfo.msg);
              this.$router.replace({ path: "./login" });
              return;
            }
            let element = res.data.data;
            let start = new Date(),
              end = new Date();
            start.setTime(element.order_time_start);
            end.setTime(element.order_time_end);
            let orderTime = `${start.getFullYear()}/${
              start.getMonth() - 0 + 1
            }/${start.getDate()} ${start.getHours()}:${start
              .getMinutes()
              .toString()
              .padStart(2, "0")}-${end.getHours()}:${end
              .getMinutes()
              .toString()
              .padStart(2, "0")} `;
            this.orderTime = orderTime;
            this.active = element.order_state;
            this.state = element.order_state;
            this.place_label = element.place_label;
            this.order_apply_reason = element.order_apply_reason;
            this.order_reject_reason = element.order_reject_reason;
            this.order_rejecter = element.order_rejecter;
            this.order_id = element.order_id;
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
.disButton {
  display: none;
}
</style>
