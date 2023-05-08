<template>
  <div>
    <return-modle :title="title"></return-modle>
    <div style="padding-block-start: 3em">
      <!--                            时间选择                    -->

      <mt-tab-container v-model="selected">
        <mt-tab-container-item id="book">
          <mt-cell :title="dateDetil">
            <mt-button @click="selectData()" type="primary" size="small"
              >选择时间</mt-button
            >
          </mt-cell>

          <mt-cell v-if="buttonDisplay" title="预约开始时间:">
            <mt-picker
              ref="timePicker"
              class="dateS"
              v-model="dataGlobel"
              :slots="slots"
              :visible-item-count="visibleItemCount"
            ></mt-picker>

            <mt-button @click="sureTime(start)" type="primary" size="small"
              >确认时间</mt-button
            >
          </mt-cell>

          <mt-cell v-if="buttonDisplay2" title="预约结束时间:">
            <mt-picker
              ref="timePicker2"
              class="dateS"
              v-model="dataGlobel2"
              :slots="slots2"
              :visible-item-count="visibleItemCount"
            ></mt-picker>

            <mt-button @click="sureTime(end)" type="primary" size="small"
              >确认时间</mt-button
            >
          </mt-cell>

          <mt-cell :style="cellDisplay" :title="cellTitle"> </mt-cell>
        </mt-tab-container-item>
      </mt-tab-container>

      <!--                         -->

      <!--                        搜索按钮                -->

      <div :style="searchDisplay">
        <mt-button
          style="width: 50vw"
          @click="search()"
          type="primary"
          size="small"
          ><div v-if="!loading">
            <i class="el-icon-search" style="padding-right: 4px"></i>搜索
          </div>
          <mt-spinner v-else-if="loading" type="triple-bounce"></mt-spinner>
        </mt-button>
      </div>

      <mt-cell :style="infoDisplay" title="现有场地:"></mt-cell>

      <!--                         -->

      <!--                        查找后的信息                    -->

      <mt-tab-container
        :style="infoDisplay"
        v-model="selected"
        style="padding-block-end: 10vh"
      >
        <mt-tab-container-item id="book">
          <mt-cell
            v-for="(n, key) in placesInfo"
            :key="key"
            v-on:click.native="selectPlace(n)"
            :title="n.place_name"
            :label="n.place_label"
          >
            <i slot="icon" class="el-icon-school"></i> >
          </mt-cell>
        </mt-tab-container-item>
      </mt-tab-container>

      <!--                                                 -->

      <!--                            导航栏                                      -->

      <mtabbar
        @updateSelected="updateSelected"
        :selected="this.selected"
      ></mtabbar>

      <!--            日期选择器                       -->

      <div @touchmove.prevent>
        <mt-datetime-picker
          ref="picker"
          type="date"
          v-model="pickerValue"
          :start-date="startData"
          :end-date="endDate"
          @confirm="handleConfirm()"
          year-format="{value}年"
          month-format="{value}月"
          date-format="{value}日"
        >
        </mt-datetime-picker>
      </div>
    </div>
    <!--                                             -->
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
    let earlyOpenTime, cellTime, startTime, cells;
    const basicSet = basicSetting();
    function getData() {
      //初始化时获取数据的函数
      earlyOpenTime = basicSet.setting.earlyOpenTime;
      cellTime = basicSet.setting.cellTime;
      startTime = basicSet.setting.startTime;
      cells = basicSet.setting.cells;
    }
    getData();

    var pickerValue = "";

    function getAfterDate(AddDayCount) {
      //addDayCount天后
      var endDate = new Date();
      endDate.setDate(endDate.getDate() + AddDayCount - 1);
      return endDate;
    }
    return {
      dateC: [],
      placesInfo: [],
      // popupVisible:false,
      fixed: true,
      start: "start",
      infoDisplay: "display:none",
      searchDisplay: "display:none",
      cellTitle: "确认预约时间信息:", //此变量最后变为收集时间后的拼接字符
      cellDisplay: "display:none",
      dataGlobel: [],
      buttonDisplay: false,
      slots: [],
      selected: "book",
      pickerValue,
      dateVal: "", // 默认是当前日期
      selectedValue: "",
      dateDetil: "预约日期:",
      startData: new Date(),
      endDate: getAfterDate(basicSet.setting.earlyOpenTime), //开放7天内的预约时间，可修改
      visibleItemCount: 3,
      end: "end",

      dataGlobel2: [],
      slots2: [],
      buttonDisplay2: false,
      title: "按时间预约",
      loading: false,
      isChange: true,
      firstDateSelect: true,
      earlyOpenTime: basicSet.setting.earlyOpenTime,
      cellTime: basicSet.setting.cellTime,
      startTime: basicSet.setting.startTime,
      cells: basicSet.setting.cells,
    };
  },
  computed: {},
  methods: {
    updateSelected(e) {
      this.selected = e;
    },
    change(selected) {
      //导航栏切换
      // console.log("ook");
      if (selected !== "book") {
        this.$router.push({ path: "home" });
      }
    },
    selectData() {
      // 打开时间选择器
      // 如果已经选过日期，则再次打开时间选择器时，日期回显（不需要回显的话可以去掉 这个判断）
      if (this.selectedValue) {
        this.pickerValue = this.selectedValue;
      } else {
        this.pickerValue = new Date();
      }
      this.$refs.picker.open();
      this.isChange = true;
    },
    //hack: 当遇到第二天凌晨时，出现时间选择会有1点开始的bug done
    handleConfirm() {
      this.buttonDisplay = false;
      //获取年月日，并且进行添加开始时间选择器的数据组
      let dateV = [];
      this.dateC = [];
      let dateN = new Date();
      let lastHour =
        this.startTime + parseInt((this.cells * this.cellTime) / 60);
      if (this.pickerValue.getDate() == new Date().getDate()) {
        if (this.pickerValue.getHours() >= lastHour) {
          //在页面操作当前时间大于22:00时，直接进行对下一天的操作，设定初始时间为8:00
          this.pickerValue.setDate(this.pickerValue.getDate() + 1);
          dateN.setHours(this.startTime - 1); //设定最早预约时间
        }
        if (this.pickerValue.getHours() <= this.startTime) {
          dateN.setHours(this.startTime - 1); //设定最早预约时间
        }
        for (let i = dateN.getHours(); i <= lastHour - 1; i++) {
          //在页面操作当前时间小于22:00时的操作
          dateV.push(i + 1);
        }
      } else {
        for (let i = this.startTime - 1; i <= lastHour - 1; i++) {
          dateV.push(i + 1);
        }
      }
      for (let i = 0; i <= 60 / this.cellTime; i++) {
        if (i * this.cellTime < 60) {
          if (i * this.cellTime == 0) {
            this.dateC.push("00");
          } else {
            this.dateC.push(i * this.cellTime + "");
          }
        }
      }
      this.dateDetil =
        "预约日期:" +
        this.pickerValue.getFullYear() +
        "年" +
        (this.pickerValue.getMonth() + 1) +
        "月" +
        this.pickerValue.getDate() +
        "日";
      // console.log(dateN.getHours());
      this.slots = [
        {
          values: dateV,
          textAlign: "right",
        },
        {
          divider: true,
          content: ":",
          className: "slot2",
        },
        {
          values: this.dateC,
          textAlign: "left",
        },
      ];
      if (this.firstDateSelect) {
        this.buttonDisplay = true;
        this.cellTitle = "";
        this.searchDisplay = "display:none";
        this.firstDateSelect = false;
      } else {
        this.buttonDisplay = true;
        this.buttonDisplay2 = false;
        this.cellTitle = "";
        this.searchDisplay = "display:none";
      }
    },
    sureTime(type) {
      //确认按钮函数
      let lastHour =
        this.startTime + parseInt((this.cells * this.cellTime) / 60);
      if (type == "start") {
        //获取预约时间的用户开始使用时间,并且进行添加结束时间选择器的数据组
        if (this.slots[2].values.length == 1) {
          this.handleConfirm();
          return;
        }
        this.dataGlobel = this.$refs.timePicker.getValues();
        // console.log(this.dataGlobel);
        let dateV = [];
        for (let i = Number(this.dataGlobel[0]); i <= lastHour; i++) {
          dateV.push(i);
        }
        this.slots2 = [
          {
            values: dateV,
            textAlign: "right",
          },
          {
            divider: true,
            content: ":",
            className: "slot2",
          },
          {
            values: this.dateC,
            textAlign: "left",
          },
        ];
        if (this.buttonDisplay2) {
          this.$refs.timePicker2.setSlotValue(0, Number(this.dataGlobel[0]));
          this.$refs.timePicker2.setSlotValue(1, this.dataGlobel[1]);
        }
        this.buttonDisplay2 = true; //对选择结束时间按钮显身
      } else if (type == "end") {
        //获取预约时间的用户开始使用时间
        // console.log(this.dataGlobel)
        this.dataGlobel2 = this.$refs.timePicker2.getValues();
        if (
          (this.dataGlobel2[0] == this.dataGlobel[0] &&
            this.dataGlobel2[1] <= this.dataGlobel[1]) ||
          !this.dataGlobel2[0] ||
          !this.dataGlobel[0]
        ) {
          MessageBox.alert("预约最少" + this.cellTime + "分钟起", "提示");
          return;
        }
        this.cellDisplay = "display:block"; //搜索按钮显示

        this.cellTitle =
          "预约时间段为: " +
          this.dateDetil.substr(5) +
          " " +
          this.dataGlobel[0] +
          ":" +
          this.dataGlobel[1] +
          "-" +
          this.dataGlobel2[0] +
          ":" +
          this.dataGlobel2[1];
        this.searchDisplay =
          "align-content: center;align-items: center;text-align: center;padding-top:1vh;padding-bottom:1vh;display:block";
      }
      this.isChange = true;
    },
    async search() {
      //搜索按钮点击事件,在此进行发收包操作
      // console.log(this.pickerValue, this.dataGlobel, this.dataGlobel2)
      let res;
      if (this.isChange) {
        this.loading = true;
        this.placesInfo = [];
        try {
          let timeString =
            this.pickerValue.getFullYear() +
            "/" +
            (this.pickerValue.getMonth() + 1) +
            "/" +
            this.pickerValue.getDate() +
            " ";
          res = await this.$axios({
            method: "post",
            url: "/api/order/selectTimeFindPlace",
            data: {
              start: Date.parse(
                timeString +
                  this.dataGlobel[0] +
                  ":" +
                  Number(this.dataGlobel[1]) +
                  ":00"
              ),
              end: Date.parse(
                timeString +
                  this.dataGlobel2[0] +
                  ":" +
                  Number(this.dataGlobel2[1]) +
                  ":00"
              ),
            },
            headers: { "Content-Type": "application/json" },
          });
          console.log(res);
          if (res.data.loginInfo) {
            MessageBox.alert(res.data.loginInfo.msg);
            this.$router.replace({ path: "./login" });
            return;
          }
          this.infoDisplay = "display:block"; //对搜索信息框进行显示
          this.placesInfo.push(...res.data.data);
          this.loading = false;
          this.isChange = false;
        } catch (error) {
          this.loading = false;
          MessageBox.alert("服务器繁忙");
        }
      }
      // console.log("start:", new Date(temp.setHours(this.dataGlobel[0])).setMinutes(Number(this.dataGlobel[1])), "\nend:", new Date(temp.setHours(this.dataGlobel2[0])).setMinutes(Number(this.dataGlobel2[1])))
    },
    selectPlace(info) {
      //信息栏的点击事件，进行跳转
      // console.log(this.cellTitle);
      // fixedBug:时间戳秒不为零导致无法匹配时间段
      let timeString =
        this.pickerValue.getFullYear() +
        "/" +
        (this.pickerValue.getMonth() + 1) +
        "/" +
        this.pickerValue.getDate() +
        " ";
      const start = Date.parse(
        timeString +
          this.dataGlobel[0] +
          ":" +
          Number(this.dataGlobel[1]) +
          ":00"
      );
      const end = Date.parse(
        timeString +
          this.dataGlobel2[0] +
          ":" +
          Number(this.dataGlobel2[1]) +
          ":00"
      );
      this.$router.push({
        path: "/timeDetail",
        query: {
          times: this.cellTitle,
          info,
          date:
            this.pickerValue.getFullYear() +
            "-" +
            (this.pickerValue.getMonth() + 1) +
            "-" +
            this.pickerValue.getDate(),
          start,
          end,
        },
      });
    },
  },
};
</script>

<style scoped>
.dateS {
  width: 150px;
}
</style>
