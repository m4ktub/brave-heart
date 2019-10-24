import Vue from "vue";

import * as fa from "@fortawesome/vue-fontawesome";
import * as fas from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
library.add(fas.faChevronLeft);
library.add(fas.faChevronRight); 
library.add(fas.faSlidersH);

import Popup from "../components/Popup.vue";
import UsageComponent from "../components/Usage.vue";

Vue.component('fa-icon', fa.FontAwesomeIcon)
Vue.component('usage', UsageComponent);

new Vue({
    render: h => h(Popup)
}).$mount("#popup");
