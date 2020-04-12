// apply global style
import "../css/style.css";

// globally register Font Awesome icons
import * as far from "@fortawesome/free-regular-svg-icons";
import * as fas from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
library.add(fas.faBan);
library.add(fas.faCoins);
library.add(fas.faCopy);
library.add(far.faClock);
library.add(fas.faTrashRestore);
library.add(fas.faChevronLeft);
library.add(fas.faChevronRight); 
library.add(fas.faSlidersH);
library.add(fas.faHandHoldingUsd);
library.add(fas.faPencilAlt);
library.add(far.faQuestionCircle);

// globally register components
import Vue from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import UsageComponent from "../components/Usage.vue";

Vue.component('fa-icon', FontAwesomeIcon)
Vue.component('usage', UsageComponent);
