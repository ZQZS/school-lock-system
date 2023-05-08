<template>
  <div>
    <return-modle :title="title"></return-modle>
    <div style="padding-block-start: 3em">
      <mt-tab-container style="padding-block-end: 10vh" v-model="selected">
        <mt-tab-container-item class="bookButton" id="book">
          <mt-cell
            class="bookButton"
            :label="n.place_label"
            v-on:click.native="selectPlace(n)"
            v-for="(n, key) in placesData"
            :key="key"
            :title="n.place_name"
            ><mt-badge color="#009900"
              >已预约:{{ n.ordered_user_number || "0" }}</mt-badge
            >
            <i slot="icon" class="el-icon-office-building"></i>
          </mt-cell>
        </mt-tab-container-item>
      </mt-tab-container>

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
import { MessageBox } from "mint-ui";
export default {
  components: { Mtabbar, ReturnModle },
  beforeRouteLeave(to, from, next) {
    // console.log(to, this.$root.oldUrl);
    if (to.name == "PlacesTimeSelect") {
      this.$root.oldUrl = JSON.stringify(to);
    }
    next();
  },
  data() {
    return {
      selected: "book",
      fixed: true,
      title: "按地点预约",
      placesData: [],
    };
  },
  beforeMount: async function () {
    let res, placesData;
    res = await this.$axios({
      method: "get",
      url: "/api/order/getPlaceList",
      headers: { "Content-Type": "application/json" },
    });
    if (res.data.loginInfo) {
      MessageBox.alert(res.data.loginInfo.msg);
      this.$router.replace({ path: "./login" });
      return;
    }
    this.placesData.push(...res.data.data);
  },
  methods: {
    updateSelected(e) {
      this.selected = e;
    },
    selectPlace(info) {
      this.$router.push({
        path: "./placesTimeSelect",
        query: { info: JSON.stringify(info) },
      });
    },
  },
};
</script>

<style scoped></style>
