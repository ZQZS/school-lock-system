<template>
  <div>
    <return-modle :title="title"></return-modle>
    <div style="padding-block-start: 3em">
      <mt-field
        :readonly="true"
        label="地点"
        placeholder="地点"
        v-model="placename"
      ></mt-field>
      <!--                            时间选择                    -->
      <mt-tab-container v-model="selected">
        <mt-tab-container-item id="book">
          <mt-cell title="预约开始时间:">
            <mt-picker
              ref="timePicker"
              class="dateS"
              v-model="dataGlobel"
              :slots="slots"
              :visible-item-count="visibleItemCount"
            ></mt-picker>
            <mt-button
              :style="buttonDisplay"
              @click="sureTime('start')"
              type="primary"
              size="small"
              >确认时间</mt-button
            >
          </mt-cell>
          <mt-cell title="预约结束时间:">
            <mt-picker
              ref="timePicker2"
              class="dateS"
              v-model="dataGlobel2"
              :slots="slots2"
              :visible-item-count="visibleItemCount"
            ></mt-picker>
            <mt-button
              :style="buttonDisplay2"
              @click="sureTime('end')"
              type="primary"
              size="small"
              >确认时间</mt-button
            >
          </mt-cell>
        </mt-tab-container-item>
      </mt-tab-container>

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
      <mt-button :style="bookDisplay" size="large" type="primary" @click="order"
        >确定预约</mt-button
      >
      <mt-cell></mt-cell>
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
    let slots = [];
    let dateC = [];
    let UrlTimeSlot = [];
    let startTime, cellTime;
    let placename, placeID;
    function getSlotsV(Urlinfo) {
      let dateV = [];
      dateC = [];
      UrlTimeSlot = Urlinfo.time.split("-"); //获取用户准备预约的时间段
      startTime = Number(Urlinfo.startTime);
      for (
        let i = startTime + parseInt((UrlTimeSlot[2] * Urlinfo.cellTime) / 60);
        i <= startTime + parseInt((UrlTimeSlot[3] * Urlinfo.cellTime) / 60);
        i++
      ) {
        dateV.push(i);
      }
      for (let i = 0; i <= 60 / Urlinfo.cellTime; i++) {
        if (i * Urlinfo.cellTime < 60) {
          if (i * Urlinfo.cellTime == 0) {
            dateC.push("00");
          } else {
            dateC.push(i * Urlinfo.cellTime + "");
          }
        }
      }
      slots = [
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
          values: dateC,
          textAlign: "left",
        },
      ];
      placename = Urlinfo.placename;
      placeID = Urlinfo.id;
      cellTime = Urlinfo.cellTime;
    }
    getSlotsV(this.$router.currentRoute.query);

    function getData(that) {
      console.log(that.$router.currentRoute.query);
    }
    getData(this);
    return {
      //此几项需要获取-------------------------------
      placeID: placeID,
      placename: placename,
      introduction: "",
      applyerName: basicSet.user.userName,
      applyerNo: basicSet.user.userNo,
      phone: basicSet.user.phone,
      startTime: startTime,
      cellTime: cellTime,
      //--------------------------------------------
      appointment: "",
      readonly: true,
      fixed: true,
      selected: "book",
      slots: slots,
      slots2: [],
      dateC: dateC,
      UrlTimeSlot,
      visibleItemCount: 3,
      dataGlobel: [],
      dataGlobel2: [],
      buttonDisplay: "",
      buttonDisplay2: "display:none",
      bookDisplay: "display:none",
      applyerReason: "",
      title: "按地点预约",
      timeString: "",
    };
  },
  methods: {
    updateSelected(e) {
      this.selected = e;
    },
    goBack() {
      //标头导航返回按钮事件
      this.$router.go(-1);
    },
    change(selected) {
      //导航栏切换
      console.log("ook");
      if (selected !== "book") {
        this.$router.push({ path: "home", query: { selected: this.selected } });
      }
    },

    order() {
      //确定预约按钮，需要发包操作
      if (this.phone == "" || this.phone.length != 11) {
        MessageBox("提示", "手机号码格式错误");
        return;
      }
      let that = this;
      MessageBox.confirm("确定执行此操作?")
        .then(async (action) => {
          if (action === "confirm") {
            if (
              (this.dataGlobel2[0] == this.dataGlobel[0] &&
                this.dataGlobel2[1] <= this.dataGlobel[1]) ||
              !this.dataGlobel2[0] ||
              !this.dataGlobel[0]
            ) {
              MessageBox.alert("预约最少" + this.cellTime + "分钟起", "提示");
              return;
            }
            const start = Date.parse(
              that.timeString +
                that.dataGlobel[0] +
                ":" +
                Number(that.dataGlobel[1]) +
                ":00"
            );
            const end = Date.parse(
              that.timeString +
                that.dataGlobel2[0] +
                ":" +
                Number(that.dataGlobel2[1]) +
                ":00"
            );
            let res = await that.$axios({
              method: "post",
              url: "/api/order/order",
              data: {
                place_id: that.placeID,
                user_no: that.applyerNo,
                start: start,
                end: end,
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
            console.log(start, end);
          }
        })
        .catch((index) => {
          console.log(index);
        });
    },
    sureTime(type) {
      //确认按钮函数
      let startData, endData;
      if (type == "start") {
        //获取预约时间的用户开始使用时间,并且进行添加结束时间选择器的数据组
        startData = this.$refs.timePicker.getValues();
        if (this.buttonDisplay2 != "display:block") {
          this.dataGlobel = startData;
          console.log(this.dataGlobel);
          this.buttonDisplay2 = "display:block"; //对选择结束时间按钮显身
          let dateV = [];
          for (
            let i =
              this.startTime +
              parseInt((this.UrlTimeSlot[2] * this.cellTime) / 60);
            i <=
            this.startTime +
              parseInt((this.UrlTimeSlot[3] * this.cellTime) / 60);
            i++
          ) {
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
        } else {
          console.log(this.dataGlobel2, this.dataGlobel);
          if (
            (this.dataGlobel2[0] == this.dataGlobel[0] &&
              this.dataGlobel2[1] <= this.dataGlobel[1]) ||
            !this.dataGlobel2[0] ||
            !this.dataGlobel[0] ||
            this.dataGlobel2[0] < this.dataGlobel[0]
          ) {
            MessageBox.alert(
              "开始时间小于或等于结束时间 预约最少" + this.cellTime + "分钟起",
              "提示"
            );
            return;
          }
          console.log(this.dataGlobel2.length);
          this.bookDisplay = "display:block"; //搜索按钮显示
          const timeList = this.$router.currentRoute.query.time.split("-");
          const d = new Date();
          this.timeString =
            d.getFullYear() + "/" + timeList[0] + "/" + timeList[1] + " ";
          this.appointment =
            this.timeString +
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
      } else if (type == "end") {
        //获取预约时间的用户开始使用时间
        console.log(this.dataGlobel);
        endData = this.$refs.timePicker2.getValues();
        console.log(this.$refs.timePicker2.getValues());
        if (
          (endData[0] == this.dataGlobel[0] &&
            endData[1] <= this.dataGlobel[1]) ||
          !endData[0] ||
          !this.dataGlobel[0] ||
          endData[0] < this.dataGlobel[0]
        ) {
          MessageBox.alert("预约最少" + this.cellTime + "分钟起", "提示");
          return;
        }
        // console.log("endData:",((endData[0]-this.startTime)*(60/this.cellTime)+(endData[1]/this.cellTime)),"endTime:",this.UrlTimeSlot)
        if (
          (endData[0] - this.startTime) * (60 / this.cellTime) +
            endData[1] / this.cellTime >
          this.UrlTimeSlot[3]
        ) {
          MessageBox.alert(
            "预约结束时间需在" +
              (this.startTime +
                parseInt((this.UrlTimeSlot[3] * this.cellTime) / 60)) +
              ":" +
              (this.UrlTimeSlot[3] * this.cellTime -
              parseInt((this.UrlTimeSlot[3] * this.cellTime) / 60) *
                this.cellTime *
                (60 / this.cellTime)
                ? this.UrlTimeSlot[3] * this.cellTime -
                  parseInt((this.UrlTimeSlot[3] * this.cellTime) / 60) *
                    this.cellTime *
                    (60 / this.cellTime)
                : "00") +
              "之内"
          );
          return;
        }
        this.dataGlobel2 = endData;
        this.bookDisplay = "display:block"; //搜索按钮显示
        const timeList = this.$router.currentRoute.query.time.split("-");
        const d = new Date();
        this.timeString =
          d.getFullYear() + "/" + timeList[0] + "/" + timeList[1] + " ";
        this.appointment =
          this.timeString +
          this.dataGlobel[0] +
          ":" +
          this.dataGlobel[1] +
          "-" +
          this.dataGlobel2[0] +
          ":" +
          this.dataGlobel2[1];
      }
    },
  },
};
</script>

<style scoped></style>
