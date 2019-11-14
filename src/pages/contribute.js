import Vue from "vue";
import "../css/style.css";

import * as fa from "@fortawesome/vue-fontawesome";
import * as far from "@fortawesome/free-regular-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
library.add(far.faClock);

import Contribute from "../components/Contribute.vue";
import UsageComponent from "../components/Usage.vue";

Vue.component('fa-icon', fa.FontAwesomeIcon)
Vue.component('usage', UsageComponent);

new Vue({
    render: h => h(Contribute)
}).$mount("#contribute");
