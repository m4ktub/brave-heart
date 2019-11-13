import Vue from "vue";
import "../css/style.css";

import * as fa from "@fortawesome/vue-fontawesome";
import * as fas from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
library.add(fas.faTrashRestore);

import Options from "../components/Options.vue";

Vue.component('fa-icon', fa.FontAwesomeIcon)

new Vue({
    render: h => h(Options)
}).$mount("#options");
