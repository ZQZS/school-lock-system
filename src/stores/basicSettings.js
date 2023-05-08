import { defineStore } from "pinia";

export const basicSetting = defineStore("basicSetting", {
  state: () => {
    return {
      setting: {
        cells: 30, //一天分成多少个单位时间
        startTime: 8, //开始时间，单位：时
        cellTime: 30, //单位时间，单位：分
        earlyOpenTime: 7, //最早提前开放的时间，提前7天预约
      },
      user: {
        userName: "", //用户姓名
        userNo: "", //学工号
        phone: "", //手机号码 可空
        hours: 0, //每月使用时间
      },
      reservingData: [],
      reservedData: [],
      overdueData: [],
      stateList: ["已撤销", "审核中", "发放密码", "已通过", "已驳回", "已过期"],
    };
  },
  actions: {
    initSetting() {
      this.setting["cells"] = 30;
      this.setting["cellTime"] = 7;
      this.setting["earlyOpenTime"] = 30;
      this.setting["startTime"] = 8;
    },
    initUser() {
      this.user["userName"] = "";
      this.user["userNo"] = NaN;
      this.user["phone"] = "";
      this.user["hours"] = 0;
    },
    setSetting(newSetting) {
      for (let key in this.setting) {
        try {
          this.setting[key] = newSetting[key];
        } catch (error) {
          console.log("New setting format was wrong");
          this.initSetting();
          return false;
        }
      }
      return true;
    },
    setUser(newInfo) {
      return new Promise((resolve, reject) => {
        for (let key in this.user) {
          try {
            this.user[key] = newInfo[key];
          } catch (error) {
            console.log("New info format was wrong");
            this.initUser();
            reject(false);
          }
        }
        resolve(true);
      });
    },
    updateUserHours(newHour) {
      this.user.hours = newHour;
    },
  },
});
