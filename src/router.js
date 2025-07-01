import { createRouter, createWebHashHistory } from 'vue-router';
import Home from './views/Home.vue';
import ImageMerge from './views/ImageMerge.vue';
import PdfMerge from './views/PdfMerge.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/image-merge',
        name: 'ImageMerge',
        component: ImageMerge
    },
    {
        path: '/pdf-merge',
        name: 'PdfMerge',
        component: PdfMerge
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router; 