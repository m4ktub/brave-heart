import Vue from "vue";
import "../css/style.css";

import * as fa from "@fortawesome/vue-fontawesome";
import * as far from "@fortawesome/free-regular-svg-icons";
import * as fas from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
library.add(fas.faChevronLeft);
library.add(fas.faChevronRight); 
library.add(fas.faSlidersH);
library.add(fas.faBan);
library.add(far.faClock);

import Popup from "../components/Popup.vue";
import UsageComponent from "../components/Usage.vue";

Vue.component('fa-icon', fa.FontAwesomeIcon)
Vue.component('usage', UsageComponent);

new Vue({
    render: h => h(Popup)
}).$mount("#popup");
