import Vue from "vue";
import VueRouter from "vue-router";
// import App from '../App.vue'
import login from "../views/Login/Login.vue";
Vue.use(VueRouter);
Vue.config.productionTip = false;
const routes = [
  {
    path: "/login",
    name: "Login",
    meta: { title: "智能预约及管理系统-登录" },
    component: login,
    hidden: true,
  },
  {
    path: "/home",
    name: "Home",
    meta: { title: "智能预约及管理系统-主页面" },
    component: () => import("../views/Home/Home.vue"),

    hidden: true,
  },
  {
    path: "/timeSelect",
    name: "TimeSelect",
    meta: { title: "智能预约及管理系统-timeSelect" },
    component: () => import("../views/Book/Time/timeSelect.vue"),
    hidden: true,
  },
  {
    path: "/timeDetail",
    name: "TimeDetail",
    meta: { title: "智能预约及管理系统-appiontment" },
    component: () => import("../views/Book/Time/timeDetails.vue"),
    hidden: true,
  },
  {
    path: "/placesSelect",
    name: "PlacesSelect",
    meta: { title: "智能预约及管理系统-placesSelect" },
    component: () => import("../views/Book/Place/placesSelect.vue"),
    hidden: true,
  },
  {
    path: "/placesTimeSelect",
    name: "PlacesTimeSelect",
    meta: { title: "智能预约及管理系统-placesTimeSelect" },
    component: () => import("../views/Book/Place/placeTimeSelect.vue"),
    hidden: true,
  },
  {
    path: "/placeDetail",
    name: "PlaceDetail",
    meta: { title: "智能预约及管理系统-PlaceDetail" },
    component: () => import("../views/Book/Place/placeDetails.vue"),
    hidden: true,
  },
  {
    path: "/personInfo",
    name: "PersonInfo",
    meta: { title: "智能预约及管理系统-PersonInfo" },
    component: () => import("../views/PersonInfo/PersonInfo.vue"),
    hidden: true,
  },
  {
    path: "/orderInfo",
    name: "OrderInfo",
    meta: { title: "智能预约及管理系统-OrderInfo" },
    component: () => import("../views/Home/InfoList/orderInfo.vue"),
    hidden: true,
  },
  {
    path: "/register",
    name: "Register",
    meta: { title: "智能预约及管理系统-register" },
    component: () => import("../views/Login/Register.vue"),
    hidden: true,
  },
  // {
  //   path: "",
  //   // component: login,
  //   // component:personInfo,
  //   redirect: "login",
  // },
  {
    path: "",
    // component: login,
    // component:personInfo,
    redirect: "Register",
  },
];

let originPush = VueRouter.prototype.push;
let originReplace = VueRouter.prototype.replace;
// 重写push和replace
// 第一个参数，告诉原来push方法，往哪里跳转，传递哪些参数
// 第二个参数是成功的回调
// 第三个参数是失败的回调
VueRouter.prototype.push = function (location, resolve, reject) {
  if (resolve && reject) {
    // call和apply区别
    // 相同点：都可以调用函数一次，都可以篡改函数的上下文一次
    // 不同点：call和apply传递参数：call传递参数用逗号隔开，apply方法传递数组
    originPush.call(this, location, resolve, reject);
  } else {
    originPush.call(
      this,
      location,
      () => {},
      () => {}
    );
  }
};
VueRouter.prototype.replace = function (location, resolve, reject) {
  if (resolve && reject) {
    originReplace.call(this, location, resolve, reject);
  } else {
    originReplace.call(
      this,
      location,
      () => {},
      () => {}
    );
  }
};
const router = new VueRouter({
  routes,
});

export default router;
