import Vue from "vue";
import Popup from "../components/Popup.vue";
import UsageComponent from "../components/Usage.vue";

Vue.component('usage', UsageComponent);

new Vue({
    render: h => h(Popup)
}).$mount("#popup");
