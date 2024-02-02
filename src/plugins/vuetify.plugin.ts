// VUETIFY
// import "vuetify/styles";

// import "@/styles/main.scss";
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { fa } from "vuetify/iconsets/fa";

import { md } from "vuetify/iconsets/md";

// import * as components from "vuetify/components";
// import * as directives from "vuetify/directives";
// import { Theme } from "./vuetify.theme";

export const VuetifyPlugin = createVuetify({
  // components,
  // directives,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
      fa,
      md
    }
  },
  theme: {
    defaultTheme: "light",
    // themes: {
    //   light: Theme.Light.definition
    // }
  },
});
