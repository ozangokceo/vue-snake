import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import { RegisterGlobalComponentsPlugin } from './plugins/register-components.plugin';
import { VuetifyPlugin } from "./plugins/vuetify.plugin";

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
  components,
  directives,
});

const app = createApp(App).use(RegisterGlobalComponentsPlugin).use(VuetifyPlugin);

app.use(createPinia());
app.use(router);
app.use(vuetify);

app.mount('#app');
