import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { oml2d } from 'vite-plugin-oh-my-live2d';

// vite.config.js

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({

  plugins: [vue(),
  oml2d({
    dockedPosition: 'right',
    models: [
      {
        path: 'model/mai/index.json',
        position: [-10, -10],
        scale: 0.15,
        volume: 0.5
      },
    ],
    tips: {
      idleTips: {
        wordTheDay: (wordTheDayData) => {
          return wordTheDayData.hitokoto;
        }
      },
      style: {
        top: '-45%',
      }
    },
    statusBar: {
      restMessage: '休息中',
    },
    menus: {
      items: [
        {
          id: 'rest',
          icon: 'icon-rest',
          title: '休息',
          onClick: async (oml2d) => {
            oml2d.statusBarOpen(oml2d.options.statusBar?.restMessage); // 展示状态条
            oml2d.clearTips(); // 清除当前提示框内容, 并停止空闲消息播放器

            // 为状态条绑定点击事件
            oml2d.setStatusBarClickEvent(() => {
              void oml2d.statusBarClose(); // 关闭状态条
              void oml2d.stageSlideIn(); // 舞台滑入
              oml2d.statusBarClearEvents(); // 清除所有事件
            });

            void oml2d.stageSlideOut(); // 舞台滑出
          }
        },
        {
          id: 'volume',
          icon: 'icon-shengyinqiehuan',
          title: '声音切换',
          onClick: async (oml2d) => {
            // 初始化 window.isMuted
            if (typeof window.isMuted === 'undefined') window.isMuted = false;

            if (oml2d.options && oml2d.options.models && oml2d.options.models[0]) {
              if (!window.isMuted) {
                // 静音
                oml2d.options.models[0].volume = 0;
                await oml2d.reloadModel?.();
                oml2d.tipsMessage('已静音', 2000, 10);
                window.isMuted = true;
                oml2d.updateMenu && oml2d.updateMenu('volume', { title: '恢复声音' });
              } else {
                // 恢复声音
                oml2d.options.models[0].volume = 0.5;
                await oml2d.reloadModel?.();
                oml2d.tipsMessage('已恢复声音', 2000, 10);
                window.isMuted = false;
                oml2d.updateMenu && oml2d.updateMenu('volume', { title: '静音' });
              }
            } else {
              oml2d.tipsMessage('操作失败', 2000, 10);
            }
          }
        }
      ],
      style: {
        left: '-30%',
      }
    }
  })
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: '0.0.0.0',
    hmr: host
      ? {
        protocol: "ws",
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
