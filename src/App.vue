<template>
  <div class="app-container">
    <div class="bg-div"></div>
    <!-- <router-link to='/login'>gao to login</router-link> -->
    <router-view></router-view>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
.app-container {
  width: 100%;
  min-height: 90vh;
}
.bg-div {
  width: 100%;
  height: 100%;
  opacity: 0.3;
  position: fixed;
  background: url("./status/logo.png") no-repeat center center;
  background-size: contain;
}
</style>
