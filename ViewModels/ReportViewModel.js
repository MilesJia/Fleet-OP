/**
 * 报告阶段视图模型
 * 处理报告生成和历史记录管理的业务逻辑
 */
class ReportViewModel {
    /**
     * 构造函数
     * @param {FleetOperation} operation - 作战实例
     */
    constructor(operation) {
        this.operation = operation;
        this.reportText = '';
        this.onReportGenerated = null;  // 报告生成回调
    }

    /**
     * 生成报告
     * @returns {string} 报告文本
     */
    generate() {
        this.reportText = ReportService.generate(this.operation);
        if (this.onReportGenerated) {
            this.onReportGenerated(this.reportText);
        }
        return this.reportText;
    }

    /**
     * 获取报告文本
     * @returns {string} 报告文本
     */
    getReportText() {
        return this.reportText;
    }

    /**
     * 复制报告
     * @returns {Promise<Object>} 操作结果
     */
    async copyReport() {
        return await ReportService.copyToClipboard(this.reportText);
    }

    /**
     * 保存报告
     * @returns {Object} 操作结果
     */
    save() {
        const result = StorageService.addReport(new Report(this.operation));
        if (result.success) {
            this.loadHistory();
        }
        return result;
    }

    /**
     * 加载历史记录
     * @returns {Array} 历史记录数组
     */
    loadHistory() {
        return StorageService.loadReportHistory();
    }

    /**
     * 导出JSON
     */
    exportJson() {
        StorageService.exportToJson();
    }

    /**
     * 导入JSON
     * @param {File} file - 文件对象
     * @returns {Promise<Object>} 操作结果
     */
    async importJson(file) {
        return await StorageService.importFromJson(file);
    }

    /**
     * 清空历史记录
     * @returns {Object} 操作结果
     */
    clearHistory() {
        if (Helpers.confirm('确定清空所有历史记录？此操作不可恢复！')) {
            StorageService.clearHistory();
            return { success: true };
        }
        return { success: false };
    }

    /**
     * 绑定视图
     * @param {ReportView} view - 视图实例
     */
    bindView(view) {
        this.onReportGenerated = (text) => view.displayReport(text);
    }
}