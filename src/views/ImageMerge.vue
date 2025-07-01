<template>
  <div class="app-container">
    <!-- 主体内容区域 -->
    <div class="main-content">
      <div class="content-panel">
        <!-- 头部操作区 -->
        <div class="header-actions">
          <el-button @click="goBack" class="back-button">
            <el-icon><back /></el-icon> 返回
          </el-button>
          <h2 class="app-title">照片合并工具</h2>
          <div class="action-buttons">
            <el-button
              type="danger"
              @click="clearFiles"
              :disabled="fileList.length === 0"
              class="action-button"
            >
              <el-icon><delete /></el-icon> 清空列表
            </el-button>

            <el-button
              type="success"
              @click="handleMerge"
              :disabled="fileList.length === 0"
              class="action-button"
            >
              <el-icon><document /></el-icon> 生成PDF
            </el-button>
          </div>
        </div>

        <!-- 添加图片布局选项 -->
        <div class="layout-options">
          <div class="layout-title">每页图片数量：</div>
          <el-radio-group v-model="imagesPerPage" size="large">
            <el-radio-button :label="2">2张</el-radio-button>
            <el-radio-button :label="4">4张</el-radio-button>
            <el-radio-button :label="6">6张</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 替换 Element Plus 上传组件为自定义按钮上传 -->
        <div class="upload-container">
          <div class="upload-area">
            <input
              type="file"
              ref="fileInput"
              multiple
              accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
              style="display: none"
              @change="handleFileInputChange"
            />
            <div class="upload-button-area">
              <el-button type="primary" size="large" @click="triggerFileInput">
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <span>选择图片</span>
              </el-button>
              <div class="el-upload__tip">支持JPG/PNG格式图片，可多选上传</div>
            </div>
          </div>
        </div>

        <!-- 图片列表显示区 -->
        <div v-if="fileList.length > 0" class="image-list-container">
          <div class="section-header">
            <h3>
              图片列表 <span class="file-badge">{{ fileList.length }}</span>
            </h3>
            <div class="view-options">
              <el-radio-group v-model="viewMode" size="small">
                <el-radio-button label="grid">网格视图</el-radio-button>
                <el-radio-button label="list">列表视图</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <!-- 网格视图 -->
          <div v-if="viewMode === 'grid'" class="image-grid">
            <div
              v-for="(file, index) in fileList"
              :key="index"
              class="grid-item"
            >
              <div class="grid-thumbnail">
                <el-image
                  :src="file.url"
                  :alt="file.name"
                  fit="contain"
                  :preview-src-list="getPreviewSrcList()"
                  :initial-index="index"
                  :preview-teleported="true"
                />
              </div>
              <div class="grid-info">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-controls">
                  <el-button-group size="small">
                    <el-button
                      @click="moveFile(index, index - 1)"
                      :disabled="index === 0"
                      size="small"
                    >
                      <el-icon><arrow-up /></el-icon>
                    </el-button>
                    <el-button
                      @click="moveFile(index, index + 1)"
                      :disabled="index === fileList.length - 1"
                      size="small"
                    >
                      <el-icon><arrow-down /></el-icon>
                    </el-button>
                    <el-button
                      type="danger"
                      @click="removeFile(index)"
                      size="small"
                    >
                      <el-icon><delete /></el-icon>
                    </el-button>
                  </el-button-group>
                </div>
              </div>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-else class="image-list">
            <table class="file-table">
              <thead>
                <tr>
                  <th class="file-order">#</th>
                  <th class="file-thumb">缩略图</th>
                  <th class="file-name-col">文件名</th>
                  <th class="file-size">文件大小</th>
                  <th class="file-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(file, index) in fileList"
                  :key="index"
                  class="file-row"
                >
                  <td class="file-order">{{ index + 1 }}</td>
                  <td class="file-thumb">
                    <div class="thumb-container">
                      <el-image
                        :src="file.url"
                        :alt="file.name"
                        fit="contain"
                        :preview-src-list="getPreviewSrcList()"
                        :initial-index="index"
                      />
                    </div>
                  </td>
                  <td class="file-name-col">{{ file.name }}</td>
                  <td class="file-size">{{ formatFileSize(file.size) }}</td>
                  <td class="file-actions">
                    <el-button-group size="small">
                      <el-button
                        @click="moveFile(index, index - 1)"
                        :disabled="index === 0"
                        size="small"
                      >
                        <el-icon><arrow-up /></el-icon>
                      </el-button>
                      <el-button
                        @click="moveFile(index, index + 1)"
                        :disabled="index === fileList.length - 1"
                        size="small"
                      >
                        <el-icon><arrow-down /></el-icon>
                      </el-button>
                      <el-button
                        type="danger"
                        @click="removeFile(index)"
                        size="small"
                      >
                        <el-icon><delete /></el-icon>
                      </el-button>
                    </el-button-group>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- PDF生成对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="PDF已生成"
      width="500px"
      center
      destroy-on-close
      top="15vh"
    >
      <div class="pdf-dialog-content">
        <el-icon class="pdf-success-icon"><circle-check /></el-icon>
        <p>PDF文件已成功生成</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">
            <el-icon><download /></el-icon> 保存文件
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  Delete,
  Document,
  Download,
  ArrowUp,
  ArrowDown,
  CircleCheck,
  UploadFilled,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { listen } from "@tauri-apps/api/event";
import { jsPDF } from "jspdf";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { useRouter } from "vue-router";

const router = useRouter();

// 文件列表
const fileList = ref([]);

// 视图模式
const viewMode = ref("grid");

// 对话框控制
const dialogVisible = ref(false);

// 纸张格式
const paperFormat = ref("a4");

// 每页图片数量选择
const imagesPerPage = ref(4);

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 触发文件选择
const fileInput = ref(null);
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

// 文件变更处理
const handleFileInputChange = (event) => {
  const input = event.target;
  const files = input.files;

  if (!files || files.length === 0) return;

  const newFiles = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // 检查是否是图片类型
    if (file && file.type.indexOf("image/") !== 0) {
      ElMessage.error(`文件 ${file.name} 不是图片格式`);
      continue;
    }

    // 为文件创建URL
    const url = URL.createObjectURL(file);

    // 添加到文件列表
    newFiles.push({
      name: file.name,
      url,
      size: file.size,
      raw: file,
    });

    console.log("添加文件:", file.name, "，大小:", formatFileSize(file.size));
  }

  // 更新文件列表
  fileList.value = [...fileList.value, ...newFiles];

  if (newFiles.length > 0) {
    ElMessage.success(`已添加 ${newFiles.length} 张图片`);
  }

  // 重置文件输入框以允许选择相同文件
  input.value = "";
};

// Tauri 桌面端拖拽监听
onMounted(() => {
  listen("tauri://file-drop", async (event) => {
    console.log("File drop event triggered", event);
    const filePaths = event.payload;
    console.log("File paths received:", filePaths);
    for (const path of filePaths) {
      if (!/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(path)) continue;
      const file = new File([path], path.split(/[\\/]/).pop() || "", {
        type: "image/*",
      });
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result;
        fileList.value.push({
          name: file.name,
          url,
          path,
          size: 0,
          raw: file,
        });
        console.log("File added:", file.name);
      };
      reader.readAsDataURL(file);
    }
    ElMessage.success(`已添加 ${filePaths.length} 张图片`);
  });
});

// 获取所有图片的URL列表，用于预览功能
const getPreviewSrcList = () => {
  return fileList.value.map((file) => file.url);
};

// 移动文件位置
const moveFile = (fromIndex, toIndex) => {
  if (toIndex < 0 || toIndex >= fileList.value.length) return;

  const item = fileList.value[fromIndex];
  fileList.value.splice(fromIndex, 1);
  fileList.value.splice(toIndex, 0, item);
};

// 删除文件
const removeFile = (index) => {
  fileList.value.splice(index, 1);
  ElMessage.success("已删除图片");
};

// 清空所有文件
const clearFiles = () => {
  if (fileList.value.length === 0) return;

  fileList.value = [];
  ElMessage.success("已清空所有照片");
};

// 合并为PDF
const handleMerge = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning("请先添加图片");
    return;
  }

  try {
    ElMessage.info({
      message: "正在生成PDF，请稍候...",
      duration: 0,
      showClose: true,
    });

    // 创建PDF实例 - 使用A4纸张，默认为纵向
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // A4尺寸为210×297mm
    const pageWidth = 210;
    const pageHeight = 297;

    // 设置页边距
    const margin = 10;

    // 可用区域
    const usableWidth = pageWidth - 2 * margin;
    const usableHeight = pageHeight - 2 * margin;

    // 根据选择的每页图片数量确定布局
    let imagesPerRow, rows;
    if (imagesPerPage.value === 2) {
      imagesPerRow = 1;
      rows = 2;
    } else if (imagesPerPage.value === 4) {
      imagesPerRow = 2;
      rows = 2;
    } else if (imagesPerPage.value === 6) {
      imagesPerRow = 2;
      rows = 3;
    }

    // 计算单个图片的最大尺寸
    const imageMaxWidth = usableWidth / imagesPerRow;
    const imageMaxHeight = usableHeight / rows;

    // 用于跟踪当前处理进度
    let processedCount = 0;
    let currentPage = 1;

    // 处理每个图片
    for (const file of fileList.value) {
      // 计算当前图片在页面中的位置
      const pageIndex = Math.floor(processedCount / imagesPerPage.value);
      const positionOnPage = processedCount % imagesPerPage.value;
      const row = Math.floor(positionOnPage / imagesPerRow);
      const col = positionOnPage % imagesPerRow;

      // 如果是新的一页但不是第一页，添加新页面
      if (pageIndex > 0 && positionOnPage === 0) {
        pdf.addPage();
        currentPage++;
      }

      // 加载图片
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          // 计算图片的纵横比
          const ratio = img.width / img.height;

          // 确定图片在PDF中的实际尺寸（保持纵横比）
          let imgWidth, imgHeight;

          if (img.width / img.height > imageMaxWidth / imageMaxHeight) {
            // 宽度受限
            imgWidth = imageMaxWidth - 10; // 减去一些边距
            imgHeight = imgWidth / ratio;
          } else {
            // 高度受限
            imgHeight = imageMaxHeight - 10; // 减去一些边距
            imgWidth = imgHeight * ratio;
          }

          // 计算图片的位置（居中）
          const xPos =
            margin + col * imageMaxWidth + (imageMaxWidth - imgWidth) / 2;
          const yPos =
            margin + row * imageMaxHeight + (imageMaxHeight - imgHeight) / 2;

          // 添加图片到PDF
          pdf.addImage(img, "JPEG", xPos, yPos, imgWidth, imgHeight);

          // 添加图片标题（文件名）
          const fileName =
            file.name.length > 20
              ? file.name.substring(0, 17) + "..."
              : file.name;

          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          const textWidth = pdf.getTextWidth(fileName);
          const textX = xPos + (imgWidth - textWidth) / 2;
          const textY = yPos + imgHeight + 5;
          pdf.text(fileName, textX, textY);

          resolve(null);
        };

        img.onerror = () => {
          console.error("无法加载图片:", file.name);
          resolve(null);
        };

        img.src = file.url;
      });

      processedCount++;
    }

    // 关闭加载消息
    ElMessage.closeAll();

    // 保存生成的PDF对象以供后续使用
    generatedPdf.value = pdf;

    // 显示成功对话框
    ElMessage.success("PDF生成成功");
    dialogVisible.value = true;
  } catch (error) {
    console.error("生成PDF时出错:", error);
    ElMessage.closeAll();
    ElMessage.error("生成PDF时出错，请重试");
  }
};

const goBack = () => {
  router.push("/");
};

// 保存生成的PDF
const generatedPdf = ref(null);
const handleSave = async () => {
  if (!generatedPdf.value) {
    ElMessage.error("PDF尚未生成，请先生成PDF");
    return;
  }

  try {
    // 获取PDF数据
    const pdfData = generatedPdf.value.output("blob");

    // 默认文件名
    const defaultFileName = `照片合集_${new Date()
      .toLocaleDateString()
      .replace(/\//g, "-")}.pdf`;

    // 弹出保存对话框，让用户选择保存位置
    const filePath = await save({
      filters: [
        {
          name: "PDF文件",
          extensions: ["pdf"],
        },
      ],
      defaultPath: defaultFileName,
    });

    // 如果用户取消了保存操作，filePath将为null或undefined
    if (!filePath) {
      return;
    }

    // 将PDF数据转换为ArrayBuffer
    const arrayBuffer = await pdfData.arrayBuffer();
    // 将ArrayBuffer转换为Uint8Array
    const uint8Array = new Uint8Array(arrayBuffer);

    // 将PDF数据写入文件
    await writeFile(filePath, uint8Array);

    ElMessage.success("PDF已保存到: " + filePath);
    dialogVisible.value = false;
  } catch (error) {
    console.error("保存PDF时出错:", error);
    ElMessage.error("保存PDF时出错，请重试");
  }
};
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f6f8fa;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 20px;
}

.content-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 头部区域 */
.header-actions {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
  background-color: #ffffff;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.action-button {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 上传区域 */
.upload-container {
  padding: 30px 20px;
  display: flex;
  justify-content: center;
  background-color: #f9fafc;
}

/* 布局选项样式 */
.layout-options {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f9fafc;
  border-bottom: 1px solid #ebeef5;
}

.layout-title {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  margin-right: 16px;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 10px;
}

:deep(.el-radio-button__inner) {
  padding: 8px 20px;
  font-weight: 500;
  border-radius: 0;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 8px 0 0 8px;
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 8px 8px 0;
}

.upload-area {
  width: 100%;
  max-width: 680px;
}

.upload-button-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border: 2px dashed #c0c4cc;
  border-radius: 12px;
  padding: 40px 30px;
  transition: all 0.3s ease;
}

.upload-button-area:hover {
  border-color: #409eff;
  background-color: #f0f7ff;
  transform: translateY(-2px);
}

:deep(.el-button--primary.is-plain) {
  background-color: transparent;
  border-color: #409eff;
  color: #409eff;
}

:deep(.el-button--primary.is-plain:hover) {
  background-color: #ecf5ff;
  color: #409eff;
}

:deep(.el-upload__tip) {
  font-size: 14px;
  color: #909399;
  margin-top: 16px;
  text-align: center;
}

/* 图片列表容器 */
.image-list-container {
  padding: 0 24px 24px;
  overflow: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
}

.file-badge {
  margin-left: 12px;
  background-color: #ecf5ff;
  color: #409eff;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.view-options {
  margin-left: auto;
}

/* 网格视图 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  padding: 8px 0;
}

.grid-item {
  border-radius: 10px;
  overflow: hidden;
  background-color: #fff;
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
}

.grid-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.grid-thumbnail {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f5f7fa;
}

.grid-thumbnail img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

/* El-Image 样式优化 */
.grid-thumbnail :deep(.el-image) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-thumbnail :deep(.el-image__inner) {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.grid-item:hover .grid-thumbnail :deep(.el-image__inner) {
  transform: scale(1.05);
}

.grid-info {
  padding: 12px 16px;
  border-top: 1px solid #ebeef5;
}

.file-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.file-controls {
  display: flex;
  justify-content: flex-end;
}

/* 列表视图 */
.image-list {
  overflow: hidden;
  width: 100%;
}

.file-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
}

.file-table th {
  padding: 16px 12px;
  text-align: left;
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
  border-bottom: 1px solid #ebeef5;
}

.file-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #ebeef5;
  vertical-align: middle;
}

.file-row {
  transition: background-color 0.3s ease;
}

.file-row:hover {
  background-color: #f5f7fa;
}

.file-order {
  width: 60px;
  text-align: center;
  color: #909399;
  font-weight: 500;
}

.file-thumb {
  width: 100px;
}

.thumb-container {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.thumb-container :deep(.el-image) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-container :deep(.el-image__inner) {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.file-name-col {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: #303133;
}

.file-size {
  width: 120px;
  color: #606266;
}

.file-actions {
  width: 160px;
  text-align: right;
}

/* PDF对话框 */
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  padding: 20px 24px;
  background-color: #f5f7fa;
  margin: 0;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  color: #303133;
}

:deep(.el-dialog__body) {
  padding: 30px 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 24px;
  border-top: 1px solid #ebeef5;
}

.pdf-dialog-content {
  text-align: center;
  padding: 20px 0;
}

.pdf-success-icon {
  font-size: 70px;
  color: #67c23a;
  margin-bottom: 24px;
}

.pdf-dialog-content p {
  font-size: 18px;
  color: #303133;
  margin: 0;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
}

:deep(.el-button) {
  font-weight: 500;
  border-radius: 8px;
  padding: 10px 20px;
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-button--primary) {
  background-color: #409eff;
}

:deep(.el-button--primary:hover) {
  background-color: #66b1ff;
}

:deep(.el-button--danger) {
  background-color: #f56c6c;
}

:deep(.el-button--danger:hover) {
  background-color: #f78989;
}

:deep(.el-button--success) {
  background-color: #67c23a;
}
:deep(.el-button--success:hover) {
  background-color: #85ce61;
}
</style>
