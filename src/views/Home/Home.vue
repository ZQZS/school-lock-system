<template>
  <div>
    <mt-header :fixed="fixed" :title="title"></mt-header>
    <div style="padding-block-start: 3em">
      <mt-tab-container v-model="selected">
        <!--                  预约                -->
        <mt-tab-container-item class="bookButton" id="book">
          <mt-cell
            class="bookButton"
            :label="n.label"
            is-link
            :to="n.linkUrl"
            v-for="(n, key) in bookData"
            :key="key"
            :title="n.name"
          >
            <i slot="icon" :class="n.icon"></i>
          </mt-cell>
        </mt-tab-container-item>

        <!--                  查看                -->
        <mt-tab-container-item id="check">
          <el-collapse
            v-model="activeName"
            accordion
            v-if="this.selected == 'check'"
          >
            <!--预约中 -->
            <el-collapse-item>
              <template slot="title">
                <mt-cell title="预约中 ： "
                  ><i slot="icon" class="el-icon-time"></i>
                  <mt-badge color="yellowgreen">{{
                    reservingData.length
                  }}</mt-badge>
                </mt-cell>
              </template>
              <div
                v-for="n in reservingData"
                :key="n.order_id"
                @click="orderDetails(n)"
              >
                <mt-cell
                  class="bookButton"
                  :label="n.order_time"
                  :title="n.place_name"
                >
                  <mt-badge :color="'yellowgreen'"
                    >状态:{{ stateList[n.order_state] }}</mt-badge
                  >
                  <i slot="icon" class="el-icon-office-building"></i>
                </mt-cell>
              </div>
            </el-collapse-item>

            <!--已预约 -->
            <el-collapse-item>
              <template slot="title">
                <mt-cell title="已预约 ： "
                  ><i slot="icon" class="el-icon-circle-check"></i>
                  <mt-badge color="green">{{ reservedData.length }}</mt-badge>
                </mt-cell>
              </template>
              <div
                v-for="n in reservedData"
                :key="n.order_id"
                @click="orderDetails(n)"
              >
                <mt-cell
                  class="bookButton"
                  :label="n.order_time"
                  :title="n.place_name"
                >
                  <mt-badge :color="'green'">{{
                    n.passWord ? `密码: ${n.passWord}#` : `已通过`
                  }}</mt-badge>
                  <i slot="icon" class="el-icon-office-building"></i>
                </mt-cell>
              </div>
            </el-collapse-item>

            <!--已过期 -->
            <el-collapse-item>
              <template slot="title">
                <mt-cell title="已过期 ： "
                  ><i slot="icon" class="el-icon-warning-outline icon-center" />
                  <mt-badge color="gray">{{ overdueData.length }}</mt-badge>
                </mt-cell>
              </template>
              <div
                v-for="n in overdueData"
                :key="n.order_id"
                @click="orderDetails(n)"
              >
                <mt-cell
                  class="bookButton"
                  :label="n.order_time"
                  :title="n.place_name"
                >
                  <mt-badge
                    :color="
                      stateList[n.order_state] == '已过期' ? 'gray' : 'red'
                    "
                    >{{ stateList[n.order_state] }}</mt-badge
                  >
                  <i slot="icon" class="el-icon-office-building"></i>
                </mt-cell>
              </div>
            </el-collapse-item>
          </el-collapse>
        </mt-tab-container-item>

        <!--                  我的                -->
        <mt-tab-container-item id="mine">
          <mt-cell
            class="bookButton"
            :label="n.label"
            is-link
            :to="n.linkUrl"
            v-for="(n, key) in mineData"
            :key="key"
            :title="n.name"
          >
            <i slot="icon" :class="n.icon"></i>
          </mt-cell>
        </mt-tab-container-item>
      </mt-tab-container>

      <mtabbar
        @updateSelected="updateSelected"
        :selected="this.selected"
        v-on="updataUrl()"
      ></mtabbar>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Mtabbar from "Components/Mtabbar.vue";
import { basicSetting } from "stores/basicSettings";
import { Collapse, CollapseItem } from "element-ui";
import { MessageBox } from "mint-ui";
Vue.use(Collapse);
Vue.use(CollapseItem);
export default {
  components: { Mtabbar },
  data() {
    const basicSet = basicSetting();
    this.flag = false;
    let flag = true;
    let overdueData = [];
    let reservedData = [];
    let reservingData = [];
    const getOption = async () => {
      let res;
      const basicSet = basicSetting();
      res = await this.$axios({
        method: "get",
        url: "/api/order/getBookTimeOptions",
        headers: { "Content-Type": "application/json" },
      });
      if (res.data.loginInfo) {
        MessageBox.alert(res.data.loginInfo.msg);
        this.$router.replace({ path: "./login" });
        return;
      }
      const setting = res.data.data;
      basicSet.setSetting({
        cells: setting.cells,
        cellTime: setting.cell_time,
        earlyOpenTime: setting.early_open_time,
        startTime: setting.start_time,
      });
    };
    getOption();
    return {
      activeName: "1",
      fixed: true,
      selected: this.$route.query.selected || "book",
      title: "主页面",
      checkPageReload: true,
      flag,
      stateList: basicSet.$state.stateList,
      bookData: [
        {
          name: "按照时间预约",
          key: "时间",
          icon: "el-icon-time",
          label: "说明",
          linkUrl: "./timeSelect",
        },
        {
          name: "按照地点预约",
          key: "地点",
          icon: "el-icon-office-building",
          label: "说明",
          linkUrl: "./placesSelect",
        },
      ],
      mineData: [
        {
          name: "个人信息",
          key: "信息",
          icon: "el-icon-s-custom",
          label: "",
          linkUrl: "./personInfo",
        },
        {
          name: "退出登陆",
          key: "退出",
          icon: "el-icon-setting",
          label: "",
          linkUrl: "./login",
        },
      ],
      reservingData,
      overdueData,
      reservedData,
    };
  },
  methods: {
    orderDetails(e) {
      // console.log(e);
      this.$router.push({
        path: "orderInfo",
        query: { order_id: e.order_id },
      });
    },
    updataUrl() {
      if (this.$route.query.selected) {
        this.$router.replace({ path: "./home" });
      }
    },
    async updateSelected(e) {
      // console.log("传入：", e);
      this.selected = e;
      if (e !== "check") return;
      this.reservingData = [];
      this.reservedData = [];
      this.overdueData = [];
      let res = await this.$axios({
        method: "get",
        url: "/api/users/getUserOrderList",
        headers: { "Content-Type": "application/json" },
      });
      console.log(res);
      if (res.data.loginInfo) {
        MessageBox.alert(res.data.loginInfo.msg);
        this.$router.replace({ path: "./login" });
        return;
      }
      let start = new Date(),
        end = new Date();
      for (let i in res.data.data) {
        const element = res.data.data[i];
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
        element.order_time = orderTime;
        switch (element.order_state) {
          case 1:
            this.reservingData.push(element);
            break;
          case 3:
            this.reservedData.push(element);
            break;
          default:
            this.overdueData.push(element);
            break;
        }
      }
    },
  },
};
</script>

<style scoped>
.bookButton {
  min-height: 9vh;
}

.check {
  align-content: center;
  align-items: center;
  text-align: center;
  min-height: 9vh;
}

.icon-center {
}
</style>
