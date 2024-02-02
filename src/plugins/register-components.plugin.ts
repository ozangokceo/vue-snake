import type { App } from 'vue'

import TheSnake from "@/components/TheSnake.vue";
import ZetPanel from "@/components/ZetPanel.vue";

export const RegisterGlobalComponentsPlugin = {
  install(app: App<Element>) {
    app.component('TheSnake', TheSnake)
    app.component('ZetPanel', ZetPanel)
  },
}
