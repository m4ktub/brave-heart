import "./common";

import Vue from "vue";
import Popup from "../components/Popup.vue";

new Vue({
    render: h => h(Popup)
}).$mount("#popup");
