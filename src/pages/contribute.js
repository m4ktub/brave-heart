import Vue from "vue";
import Contribute from "../components/Contribute.vue";
import UsageComponent from "../components/Usage.vue";

Vue.component('usage', UsageComponent);

new Vue({
    render: h => h(Contribute)
}).$mount("#contribute");
