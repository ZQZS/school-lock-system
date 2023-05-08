<template>
  <mt-tabbar v-on="change(tabbarSelect)" v-model="tabbarSelect" :fixed="fixed">
    <mt-tab-item id="book">
      <i slot="icon" class="el-icon-bell"></i> 预约
    </mt-tab-item>

    <mt-tab-item id="check">
      <i slot="icon" class="el-icon-key"></i> 查看
    </mt-tab-item>

    <mt-tab-item id="mine">
      <i slot="icon" class="el-icon-user"></i> 我的
    </mt-tab-item>
  </mt-tabbar>
</template>

<script>
export default {
  flag: "false",
  name: "Mtabbar",
  props: {
    selected: {
      type: String,
      default: "book",
    },
    fixed: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      tabbarSelect: this.selected,
    };
  },
  methods: {
    //导航栏切换
    change(e) {
      //  console.log(this.$route);
      this.$emit("updateSelected", e);
      // this.$router.push({ path: "./"+'home' });
      if (this.$route.path != "/home" && this.flag && this.oldSelect != e) {
        this.$router.push({ path: "./home", query: { selected: e } });
      }
      this.flag = true;
      this.oldSelect = e;
      // console.log(this);
    },
  },
  watch: {
    selected:function(newValue) {
      this.tabbarSelect = newValue;
    },
  },
};
</script>

<style scoped></style>
