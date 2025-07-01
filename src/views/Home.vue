<template>
  <div class="home-container">
    <div class="home-content">
      <div class="logo-container">
        <div class="app-logo">
          <img src="/logo.png" alt="Logo" class="custom-logo-img" />
        </div>
        <p class="logo-text">happyice</p>
      </div>

      <div class="feature-cards">
        <div class="feature-card" @click="navigateTo('image-merge')">
          <div class="icon-wrapper">
            <el-icon class="feature-icon"><Picture /></el-icon>
          </div>
          <div class="feature-info">
            <h2 class="feature-title">照片合并</h2>
            <p class="feature-desc">将多张照片合并为PDF文档</p>
          </div>
        </div>

        <div class="feature-card" @click="navigateTo('pdf-merge')">
          <div class="icon-wrapper">
            <el-icon class="feature-icon"><Document /></el-icon>
          </div>
          <div class="feature-info">
            <h2 class="feature-title">发票合并</h2>
            <p class="feature-desc">将多个PDF文件合并为一个</p>
          </div>
        </div>
      </div>

      <div class="app-footer">
        <!-- <p>happyice</p> -->
        <div class="sponsor-button" @click="showSponsorDialog">
          <el-icon class="sponsor-icon"><Star /></el-icon>
          <span>赞助支持</span>
        </div>

        <div class="official-website" @click="openOfficialWebsite">
          <el-icon class="website-icon"><Link /></el-icon>
          <span>前端工具导航网站</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 赞助弹窗 -->
  <el-dialog
    v-model="sponsorDialogVisible"
    title="赞助支持"
    width="360px"
    align-center
  >
    <div class="sponsor-dialog-content">
      <p class="sponsor-text">感谢您的支持和认可！</p>

      <el-tabs
        v-model="activePaymentTab"
        @tab-change="handleTabChange"
        class="centered-tabs"
      >
        <el-tab-pane label="支付宝" name="alipay" center>
          <div class="qrcode-container">
            <div class="placeholder-qrcode">
              <el-image
                style="width: 200px; height: 200px"
                :src="alipayUrl"
                fit="contain"
                :loading="alipayLoading"
              >
                <template #placeholder>
                  <div class="image-loading">
                    <el-icon class="is-loading"><Loading /></el-icon>
                    <p>正在加载支付宝二维码...</p>
                  </div>
                </template>
                <template #error>
                  <div class="image-error">
                    <el-icon><WarningFilled /></el-icon>
                    <p>图片加载失败</p>
                    <el-button size="small" @click="loadAlipayQrcode"
                      >重试</el-button
                    >
                  </div>
                </template>
              </el-image>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="微信支付" name="wechat" center>
          <div class="qrcode-container">
            <div class="placeholder-qrcode">
              <el-image
                style="width: 200px; height: 200px"
                :src="wechatUrl"
                fit="contain"
                :loading="wechatLoading"
              >
                <template #placeholder>
                  <div class="image-loading">
                    <el-icon class="is-loading"><Loading /></el-icon>
                    <p>正在加载微信二维码...</p>
                  </div>
                </template>
                <template #error>
                  <div class="image-error">
                    <el-icon><WarningFilled /></el-icon>
                    <p>图片加载失败</p>
                    <el-button size="small" @click="loadWechatQrcode"
                      >重试</el-button
                    >
                  </div>
                </template>
              </el-image>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="sponsorDialogVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { openUrl } from "@tauri-apps/plugin-opener";
import { ref, onMounted } from "vue";

const router = useRouter();
const sponsorDialogVisible = ref(false);
const activePaymentTab = ref("alipay");
const alipayUrl = ref("");
const wechatUrl = ref("");

// 支付图片URLs
const alipayRawUrl = "https://www.dxkjs.com/1/alipay.jpg";
const wechatRawUrl = "https://www.dxkjs.com/1/wechart.png";

// 图片加载状态
const alipayLoading = ref(true);
const wechatLoading = ref(true);

// 切换支付方式时重新加载对应图片
const handleTabChange = (tab) => {
  if (tab === "alipay") {
    loadAlipayQrcode();
  } else {
    loadWechatQrcode();
  }
};

// 加载支付宝二维码
const loadAlipayQrcode = () => {
  alipayLoading.value = true;
  // 直接使用图片链接
  alipayUrl.value = alipayRawUrl;
  // 模拟加载完成
  setTimeout(() => {
    alipayLoading.value = false;
  }, 500);
};

// 加载微信二维码
const loadWechatQrcode = () => {
  wechatLoading.value = true;
  // 直接使用图片链接
  wechatUrl.value = wechatRawUrl;
  // 模拟加载完成
  setTimeout(() => {
    wechatLoading.value = false;
  }, 500);
};

// 初始加载支付宝二维码
onMounted(() => {
  loadAlipayQrcode();
});

const navigateTo = (path) => {
  router.push(`/${path}`);
};

const openOfficialWebsite = async () => {
  // 使用Tauri的opener插件打开默认浏览器访问网站
  try {
    ElMessage.success("正在访问...");
    await openUrl("https://happyice.ct.ws");
  } catch (error) {
    console.error("无法打开网站:", error);
  }
};

const showSponsorDialog = () => {
  sponsorDialogVisible.value = true;
  // 打开弹窗时加载默认二维码
  loadAlipayQrcode();
};
</script>

<style scoped>
.home-container {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f6f8fa;
}

.home-content {
  max-width: 700px;
  width: 100%;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  padding: 36px;
  text-align: center;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.app-logo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff, #95c8ff);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  box-shadow: 0 8px 16px rgba(64, 158, 255, 0.25);
  overflow: hidden;
}

.custom-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-text {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.app-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 30px;
  position: relative;
  display: inline-block;
  padding-bottom: 10px;
}

.app-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #409eff, #95c8ff);
  border-radius: 3px;
}

.feature-cards {
  display: flex;
  flex-direction: row;
  gap: 24px;
  margin-bottom: 30px;
  justify-content: center;
}

.feature-card {
  background-color: #f9fafc;
  border-radius: 10px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #ebeef5;
  text-align: center;
  width: 42%;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  background-color: #f0f7ff;
  border-color: #409eff;
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(64, 158, 255, 0.15);
}

.feature-card:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #409eff, #95c8ff);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover:before {
  opacity: 1;
}

.icon-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: rgba(64, 158, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

.feature-icon {
  font-size: 36px;
  color: #409eff;
}

.feature-info {
  width: 100%;
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px;
}

.feature-desc {
  font-size: 14px;
  color: #606266;
  margin: 0;
  line-height: 1.5;
}

.app-footer {
  margin-top: 30px;
  color: #909399;
  font-size: 12px;
  letter-spacing: 1px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.sponsor-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  background-color: #fff6f6;
  border: 1px solid #ffdbdb;
  border-radius: 20px;
  padding: 6px 16px;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #ff7676;
}

.sponsor-button:hover {
  background-color: #fff0f0;
  box-shadow: 0 4px 12px rgba(255, 118, 118, 0.15);
  transform: translateY(-2px);
}

.sponsor-icon {
  font-size: 16px;
  color: #ff7676;
}

.official-website {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  background-color: #f0f7ff;
  border: 1px solid #d9ecff;
  border-radius: 20px;
  padding: 6px 16px;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #409eff;
}

.official-website:hover {
  background-color: #ecf5ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.website-icon {
  font-size: 16px;
  color: #409eff;
}

/* 赞助弹窗样式 */
.sponsor-dialog-content {
  text-align: center;
  padding: 0 10px;
}

.sponsor-text {
  color: #606266;
  margin-bottom: 20px;
  font-size: 14px;
}

/* 标签居中显示 */
.centered-tabs :deep(.el-tabs__header) {
  display: flex;
  justify-content: center;
}

.centered-tabs :deep(.el-tabs__nav-wrap::after) {
  left: 0;
  right: 0;
}

.centered-tabs :deep(.el-tabs__nav) {
  float: none;
  margin: 0 auto;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  margin: 15px 0;
}

.payment-qrcode {
  width: 200px;
  height: 200px;
  object-fit: contain;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.placeholder-qrcode {
  width: 200px;
  height: 200px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  overflow: hidden;
}

.image-loading,
.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  font-size: 14px;
  color: #909399;
}

.image-loading .el-icon,
.image-error .el-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.image-error .el-icon {
  color: #f56c6c;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}
</style>
