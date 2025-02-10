import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'mainMenu',
    path: '/',
    component: () => import('src/ui/pages/MainMenuPage.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('ui/pages/ErrorNotFound.vue'),
  },
];

export default routes;
