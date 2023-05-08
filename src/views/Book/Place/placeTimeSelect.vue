<template>
  <div>
    <return-modle :title="title"></return-modle>
    <div style="padding-block-start: 3em; padding-block-end: 10vh">
      <mt-field
        :readonly="true"
        label="地点"
        placeholder="地点"
        v-model="placename"
      ></mt-field>
      <mt-field
        :readonly="true"
        label="地点介绍"
        placeholder="地点介绍"
        type="textarea"
        rows="4"
        v-model="introduction"
      >
      </mt-field>
      <mt-cell></mt-cell>
      <div style="align-content: center; text-align: center; margin: auto">
        <mt-button
          class="el-icon-search"
          @click="addTd()"
          type="primary"
          size="small"
          >该地点时间预约表</mt-button
        >
      </div>
      <div :style="timeTableStyle">
        <table
          align="center"
          border="0"
          width="100%"
          bgcolor="#FFFFFF"
          id="timeTable"
          cellpadding="0"
          cellspacing="0"
        >
          <tbody id="timeTableBody"></tbody>
        </table>
      </div>
    </div>
    <!--                            导航栏                                      -->
    <mtabbar
      @updateSelected="updateSelected"
      :selected="this.selected"
    ></mtabbar>
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
    let cells, startTime, introduction, placename, cellTime;
    let TimeTable = [];
    let oldUrl = this.$route;
    const basicSet = basicSetting();
    introduction = JSON.parse(oldUrl.query.info).place_introduction;
    placename = JSON.parse(oldUrl.query.info).place_name;
    cells = basicSet.setting.cells;
    startTime = basicSet.setting.startTime;
    cellTime = basicSet.setting.cellTime;
    return {
      selected: "book",
      fixed: true,
      timeTableStyle: "display:none",
      placename: placename,
      introduction: introduction,
      htmlTb: "",
      cellTime: cellTime, //单位时间，单位：分钟
      cells: cells, //单位时间数，目前总共15小时
      startTime: startTime, //初始开始时间，整数
      TimeTable: [],
      title: "按地点预约",
    };
  },
  beforeMount: async function () {},
  methods: {
    updateSelected(e) {
      this.selected = e;
    },
    addTd: async function () {
      const res = await this.$axios({
        method: "post",
        url: "/api/order/selectPlaceFindTime",
        data: {
          place_id: JSON.parse(this.$route.query.info).place_id,
        },
        headers: { "Content-Type": "application/json" },
      });
      if (res.data.loginInfo) {
        MessageBox.alert(res.data.loginInfo.msg);
        this.$router.replace({ path: "./login" });
        return;
      }
      const basicSet = basicSetting();
      this.TimeTable = await this.getTimeTableArray(res.data.data, this);
      console.log(res.data.data);
      let TB = this.TimeTable;
      var q = [0, 0, 0, 0, 0, 0, 0]; //标记多少行因合并格式而不用添加<td>
      var d = [0, 0, 0, 0, 0, 0, 0]; //记录已经使用的data数组的长度
      var htmltb = `<tr border="0"><th style="width: 32px;">&nbsp;</th>`;
      TB.forEach((i) => {
        htmltb += `<th>${i.day}<p>${i.date}</p></th>`; //添加标题
      });
      this.htmlTb = htmltb;
      this.htmlTb += "</tr>";
      htmltb = "";
      let time = this.startTime;
      for (let i = 1; i <= this.cells; i++) {
        //   console.log((((i-1)*30)%60)?"30":'00')
        // 半小时为单位：${time+parseInt(((i-1)*30)/60)}:${(((i-1)*30)%60)?"30":'00'}
        htmltb += `<tr><th style="display: table-cell;vertical-align: inherit;font-weight: bold;text-align: -internal-center;height:40px;" >${i}<p>${
          time + parseInt(((i - 1) * basicSet.setting.cellTime) / 60)
        }:${
          ((i - 1) * basicSet.setting.cellTime) % 60
            ? ((i - 1) * basicSet.setting.cellTime) % 60
            : "00"
        }-${time + parseInt((i * basicSet.setting.cellTime) / 60)}:${
          (i * basicSet.setting.cellTime) % 60
            ? (i * basicSet.setting.cellTime) % 60
            : "00"
        }</p></th>`;
        //bug-----------------此情况只适用于时间单位为30的htmltb---------------------------------------------------
        //-${time+parseInt(((i)*30)/60)}:${(((i)*30)%60)?"30":'00'}
        for (let j = 0; j < TB.length; j++) {
          if (q[j] <= 0) {
            if (d[j] < TB[j].data.length) {
              // console.log(j,TB[j].data.length)
              htmltb += `<td valign="top" id="${
                TB[j].date +
                "-" +
                TB[j].data[d[j]].start +
                "-" +
                TB[j].data[d[j]].end +
                "-" +
                TB[j].data[d[j]].statu
              }" class="activity" rowspan="${
                TB[j].data[d[j]].end - TB[j].data[d[j]].start + 1
              }" style="background-color:${TB[j].data[d[j]].color}">${
                TB[j].data[d[j]].start + "-" + TB[j].data[d[j]].end + ""
              }</td>`;
              q[j] = TB[j].data[d[j]].end - TB[j].data[d[j]].start + 1;
              d[j] += 1;
              // console.log(q,d)
            }
          }
        }
        htmltb += `</tr>`;
        q = q.map((i) => {
          return (i = i - 1);
        });
      }
      //   console.log(htmltb)
      this.htmlTb += htmltb;
      this.timeTableStyle = "padding-block-start: 3vh;position: absolute;";
      document.getElementById("timeTableBody").innerHTML = this.htmlTb;
      this.timeSelect();
    },
    timeSelect() {
      document.querySelectorAll(".activity").forEach((form) => {
        form.addEventListener("click", (e) => {
          let temp = [];
          temp = e.target.id.split("-");
          if (temp[4] == "true") {
            let id = JSON.parse(this.$route.query.info).place_id;
            this.$router.push({
              path: "./placeDetail",
              query: {
                time: e.target.id,
                id: id,
                cellTime: this.cellTime,
                startTime: this.startTime,
                placename: this.placename,
              },
            });
          }
          //  console.log(e.target.id.split("-"))
          //  this.$router.push({path:"./placeDetail",query:{time:e.target.id}})
          //  console.log(e.target.id)
        });
      });
    },
    getTimeTableArray(list, that) {
      const basicSet = basicSetting();
      return new Promise((resolve, reject) => {
        let d = new Date();
        let timeTable = [];
        const listObjTemp = {};
        const weekName = new Array("日", "一", "二", "三", "四", "五", "六");
        if (d.getHours() >= 22) {
          d.setDate(d.getDate() + 1);
          d.setHours(that.startTime);
        }
        for (let i = 0; i < list.length; i++) {
          const tempD = new Date();
          tempD.setTime(list[i].order_time_start);
          const month = tempD.getMonth();
          const date = tempD.getDate();
          let startCells =
            ((tempD.getHours() - basicSet.setting.startTime) * 60 +
              tempD.getMinutes()) /
            basicSet.setting.cellTime;
          let endCells =
            parseInt(list[i].order_time_end - list[i].order_time_start) /
            1000 /
            60 /
            basicSet.setting.cellTime;
          endCells += startCells;
          if (!listObjTemp[month]) {
            listObjTemp[month] = {};
            listObjTemp[month][date] = [];
          }
          if (!listObjTemp[month][date]) {
            listObjTemp[month][date] = [];
          }
          listObjTemp[month][date].push(startCells + 1, endCells);
          listObjTemp[month][date].sort((a, b) => {
            return a - b;
          });
        }
        // console.log(listObjTemp);
        //判断是否时间戳与d的日是否同一天即可，根据setting的单位时间和单位数与时间进行计算
        for (let i = 0; i < basicSet.setting.earlyOpenTime; i++) {
          let table = {
            day: weekName[d.getDay()],
            date: d.getMonth() - 0 + 1 + "-" + d.getDate(),
            data: [],
          };
          let length = 0;
          if (listObjTemp[d.getMonth()]) {
            if (listObjTemp[d.getMonth()][d.getDate()]) {
              length = listObjTemp[d.getMonth()][d.getDate()].length;
            }
          }
          if (length === 0) {
            table.data.push({
              statu: "true",
              start: 1,
              end: basicSet.setting.cells,
              color: "green",
            });
          } else {
            let dataList = [],
              tempObj = {},
              endFlag = false;
            for (let j = 1, arrayGuide = 0; j <= basicSet.setting.cells; j++) {
              if (
                listObjTemp[d.getMonth()][d.getDate()][arrayGuide] !== j &&
                !endFlag
              ) {
                tempObj = {
                  statu: "true",
                  start: j,
                  end: NaN,
                  color: "green",
                };
                endFlag = true;
              }
              if (
                listObjTemp[d.getMonth()][d.getDate()][arrayGuide] === j &&
                endFlag
              ) {
                tempObj.end = j - 1;
                dataList.push(tempObj);
                tempObj = {};
                endFlag = false;
              }
              if (
                listObjTemp[d.getMonth()][d.getDate()][arrayGuide] === j &&
                !endFlag
              ) {
                tempObj = {
                  statu: "false",
                  start: j,
                  end: listObjTemp[d.getMonth()][d.getDate()][arrayGuide + 1],
                  color: "red",
                };
                dataList.push(tempObj);
                tempObj = {};
                j = listObjTemp[d.getMonth()][d.getDate()][arrayGuide + 1];
                arrayGuide += 2;
              }
            }
            if (endFlag) {
              tempObj.end = basicSet.setting.cells;
              dataList.push(tempObj);
            }
            table.data.push(...dataList);
            console.log(table);
          }
          d.setDate(d.getDate() + 1);
          d.setHours(that.startTime);
          timeTable.push(table);
          console.log(timeTable);
        }
        resolve(timeTable);
      });
    },
  },
};
</script>

<style scoped>
#timeTable {
  font-family: Arial, Tahoma, Geneva, sans-serif;
  font-size: 12px;
  border-spacing: 2px;
  table-layout: fixed;
  padding-block-end: 10vh;
}

tbody {
  display: table-row-group;
  vertical-align: middle;
  border-color: inherit;
}

.activity {
  margin: 1px;
  border-radius: 4px;
  color: #fff;
  padding: 4px;
  overflow: hidden;
  box-shadow: 1px 1px 3px 1px rgb(0 0 0 / 30%);
  font-weight: 300;
}

.back {
  position: absolute;
  width: 25px;
  height: 25px;
  z-index: 100;
  margin: 10px;
  top: 10px;
}
</style>
