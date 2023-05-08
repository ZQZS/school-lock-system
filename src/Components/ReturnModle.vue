<template>

    <mt-header :fixed=fixed :title="title">
        <mt-button slot="left" icon="back" @click="goBack()">返回</mt-button>
    </mt-header>
</template>

<script>
 export default {
   name:'ReturnModle',
   data() {
    return {
      fixed:true,
    }
   },
   props:{
      title:{
        type:String,
        default:''
      }
   },
   methods:{
    goBack(){//标头导航返回按钮事件   
      this.$root.oldUrl = '' 
      this.$router.go(-1);
    },
   }
}


</script>