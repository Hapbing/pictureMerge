<template>
  <div class="app-container">
    <!-- 主体内容区域 -->
    <div class="main-content">
      <div class="content-panel">
        <!-- 头部操作区 -->
        <div class="header-actions">
          <div class="left-section">
            <el-button @click="goBack" class="back-button">
              <el-icon><back /></el-icon> 返回
            </el-button>
            <h2 class="app-title">发票合并工具</h2>
          </div>
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
              <el-icon><document /></el-icon> 合并发票
            </el-button>
          </div>
        </div>

        <!-- 添加布局选项 -->
        <div class="layout-options">
          <div class="layout-title">每页发票数量：</div>
          <el-radio-group v-model="pdfsPerPage" size="large">
            <el-radio-button :label="2">2张</el-radio-button>
            <!-- <el-radio-button :label="4">4张</el-radio-button> -->
          </el-radio-group>
        </div>

        <!-- PDF上传区域 -->
        <div class="upload-container">
          <div class="upload-area">
            <input
              type="file"
              ref="fileInput"
              multiple
              accept="application/pdf"
              style="display: none"
              @change="handleFileInputChange"
            />
            <div class="upload-button-area">
              <el-button type="primary" size="large" @click="triggerFileInput">
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <span>选择PDF文件</span>
              </el-button>
              <div class="el-upload__tip">
                支持PDF格式的发票文件，可多选上传
              </div>
            </div>
          </div>
        </div>

        <!-- PDF列表显示区 -->
        <div v-if="fileList.length > 0" class="file-list-container">
          <div class="section-header">
            <h3>
              PDF文件列表 <span class="file-badge">{{ fileList.length }}</span>
            </h3>
          </div>

          <!-- 列表视图 -->
          <div class="pdf-list">
            <table class="file-table">
              <thead>
                <tr>
                  <th class="file-order">#</th>
                  <th class="file-icon">类型</th>
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
                  <td class="file-icon">
                    <el-icon class="pdf-icon"><document /></el-icon>
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
                      <!-- <el-button
                        type="primary"
                        @click="previewPdf(file)"
                        size="small"
                      >
                        <el-icon><view /></el-icon>
                      </el-button> -->
                    </el-button-group>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import {
  Delete,
  Document,
  ArrowUp,
  ArrowDown,
  UploadFilled,
  Back,
  Download,
  View,
} from "@element-plus/icons-vue";
import { ElMessage, ElLoading } from "element-plus";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { PDFDocument } from "pdf-lib";

const router = useRouter();

// 文件列表
const fileList = ref([]);

// 每页PDF数量选择
const pdfsPerPage = ref(2);

// 存储合并后的PDF数据
const mergedPdfData = ref(null);

// 返回主页
const goBack = () => {
  router.push("/");
};

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

    // 检查是否是PDF类型
    if (file && file.type !== "application/pdf") {
      ElMessage.error(`文件 ${file.name} 不是PDF格式`);
      continue;
    }

    // 创建文件URL，用于后续处理
    const fileUrl = URL.createObjectURL(file);

    // 添加到文件列表
    newFiles.push({
      name: file.name,
      size: file.size,
      raw: file,
      url: fileUrl, // 添加URL属性
      path: null, // 后续如果需要可以保存本地临时文件路径
    });

    console.log("添加文件:", file.name, "，大小:", formatFileSize(file.size));
  }

  // 更新文件列表
  fileList.value = [...fileList.value, ...newFiles];

  if (newFiles.length > 0) {
    ElMessage.success(`已添加 ${newFiles.length} 个PDF文件`);
  }

  // 重置文件输入框以允许选择相同文件
  input.value = "";
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
  ElMessage.success("已删除文件");
};

// 清空所有文件
const clearFiles = () => {
  if (fileList.value.length === 0) return;

  fileList.value = [];
  ElMessage.success("已清空所有文件");
};

// 合并PDF
const handleMerge = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning("请先添加PDF文件");
    return;
  }

  try {
    // 显示加载中
    const loadingInstance = ElLoading.service({
      lock: true,
      text: "正在合并PDF，请稍候...",
      background: "rgba(0, 0, 0, 0.7)",
    });

    // 创建新的PDF文档
    const mergedPdf = await PDFDocument.create();

    // 根据pdfsPerPage.value确定每页显示的PDF数量（2或4）
    const pdfCount = pdfsPerPage.value;
    const isTwo = pdfCount === 2;

    // 处理每个PDF文件
    const pdfFiles = [];
    for (const file of fileList.value) {
      try {
        // 使用浏览器的文件API读取文件，而不是使用readBinaryFile
        const fileArrayBuffer = await file.raw.arrayBuffer();
        pdfFiles.push({
          name: file.name,
          data: fileArrayBuffer,
        });
      } catch (err) {
        console.error(`读取文件 ${file.name} 时出错:`, err);
        ElMessage.warning(`读取文件 ${file.name} 时出错，此文件将被跳过`);
      }
    }

    // 分批处理文件，每批处理pdfCount个文件
    for (let i = 0; i < pdfFiles.length; i += pdfCount) {
      // 获取当前批次的文件
      const batchFiles = pdfFiles.slice(i, i + pdfCount);

      // 如果文件数量不足一页，可以继续处理或者给出提示
      if (batchFiles.length < pdfCount && i + pdfCount >= pdfFiles.length) {
        // 最后一批，如果不足pdfCount个，继续处理
      }

      // 为这一批次创建一个新页面
      const newPage = mergedPdf.addPage();

      // 设置页面尺寸 (A4)
      newPage.setSize(595.28, 841.89); // A4尺寸，单位为点

      // 计算每个PDF在页面上的位置和大小
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 20;

      let positions = [];

      if (isTwo) {
        // 每页2个PDF的布局
        positions = [
          {
            x: margin,
            y: pageHeight / 2 + margin / 2,
            width: pageWidth - 2 * margin,
            height: pageHeight / 2 - 1.5 * margin,
          },
          {
            x: margin,
            y: margin,
            width: pageWidth - 2 * margin,
            height: pageHeight / 2 - 1.5 * margin,
          },
        ];
      } else {
        // 每页4个PDF的布局
        const cellWidth = (pageWidth - 3 * margin) / 2;
        const cellHeight = (pageHeight - 3 * margin) / 2;
        positions = [
          {
            x: margin,
            y: pageHeight - margin - cellHeight,
            width: cellWidth,
            height: cellHeight,
          },
          {
            x: 2 * margin + cellWidth,
            y: pageHeight - margin - cellHeight,
            width: cellWidth,
            height: cellHeight,
          },
          { x: margin, y: margin, width: cellWidth, height: cellHeight },
          {
            x: 2 * margin + cellWidth,
            y: margin,
            width: cellWidth,
            height: cellHeight,
          },
        ];
      }

      // 将每个PDF嵌入到页面中
      for (let j = 0; j < batchFiles.length; j++) {
        const pdfFile = batchFiles[j];
        try {
          // 加载源PDF
          const srcPdf = await PDFDocument.load(pdfFile.data);

          // 获取源PDF的第一页
          if (srcPdf.getPageCount() > 0) {
            const [embeddedPage] = await mergedPdf.embedPages([
              srcPdf.getPage(0),
            ]);

            // 计算缩放比例，保持原始宽高比
            const position = positions[j];
            const srcWidth = embeddedPage.width;
            const srcHeight = embeddedPage.height;
            const scaleRatio = Math.min(
              position.width / srcWidth,
              position.height / srcHeight
            );

            // 计算居中的位置
            const scaledWidth = srcWidth * scaleRatio;
            const scaledHeight = srcHeight * scaleRatio;
            const centerX = position.x + (position.width - scaledWidth) / 2;
            const centerY = position.y + (position.height - scaledHeight) / 2;

            // 绘制PDF页面
            newPage.drawPage(embeddedPage, {
              x: centerX,
              y: centerY,
              width: scaledWidth,
              height: scaledHeight,
            });
          }
        } catch (err) {
          console.error(`处理文件 ${pdfFile.name} 时出错:`, err);
        }
      }
    }

    // 保存合并后的PDF
    const mergedPdfBytes = await mergedPdf.save();
    mergedPdfData.value = mergedPdfBytes;

    // 关闭加载
    loadingInstance.close();
    ElMessage.success("PDF合并成功");

    // 显示保存对话框
    await showSaveDialog();
  } catch (error) {
    console.error("合并PDF时出错:", error);
    ElMessage.closeAll();
    ElMessage.error("合并PDF时出错，请重试");
  }
};

// 显示保存对话框
const showSaveDialog = async () => {
  if (!mergedPdfData.value) {
    ElMessage.error("PDF尚未生成，请先合并PDF");
    return;
  }

  try {
    // 默认文件名
    const defaultFileName = `发票合并_${new Date()
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

    // 将合并后的PDF保存到用户选择的位置
    const pdfData = new Uint8Array(mergedPdfData.value);
    await writeFile(filePath, pdfData);

    ElMessage.success("PDF已保存到: " + filePath);
  } catch (error) {
    console.error("保存PDF时出错:", error);
    ElMessage.error("保存PDF时出错，请重试");
  }
};

// 预览PDF
const previewPdf = (file) => {
  // 使用已创建的文件URL预览PDF
  if (file.url) {
    // 在新窗口中打开PDF URL
    window.open(file.url, "_blank");
  } else {
    ElMessage.warning("无法预览PDF，请重新上传");
  }
};
</script>

<style scoped>
.app-container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f6f8fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
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

.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  padding: 8px 16px;
  font-weight: 500;
  border-radius: 8px;
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

/* 文件列表容器 */
.file-list-container {
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

/* 列表视图 */
.pdf-list {
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

.file-icon {
  width: 60px;
  text-align: center;
}

.pdf-icon {
  font-size: 24px;
  color: #f56c6c;
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

:deep(.el-button) {
  font-weight: 500;
  border-radius: 8px;
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
