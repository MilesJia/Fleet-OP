/**
 * 报告阶段视图
 * 负责报告阶段的DOM操作和UI渲染
 */
class ReportView {
    /**
     * 构造函数
     * @param {ReportViewModel} viewModel - 视图模型实例
     */
    constructor(viewModel) {
        this.viewModel = viewModel;
        this.viewModel.bindView(this);
    }

    /**
     * 显示报告文本
     * @param {string} text - 报告文本
     */
    displayReport(text) {
        Helpers.setElementText('reportOutput', text);
    }

    /**
     * 获取报告文本
     * @returns {string} 报告文本
     */
    getReportText() {
        return Helpers.getElementValue('reportOutput');
    }

    /**
     * 处理复制操作
     */
    async handleCopy() {
        const result = await this.viewModel.copyReport();
        Helpers.alert(result.message, result.success ? 'success' : 'error');
    }

    /**
     * 处理保存操作
     * @param {FirebaseService} firebaseService - Firebase服务实例
     */
    async handleSave(firebaseService = null) {
        const result = await this.viewModel.save(firebaseService);
        Helpers.alert(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            await this.renderHistory(firebaseService);
        }
    }

    /**
     * 处理导出操作
     * @param {FirebaseService} firebaseService - Firebase服务实例
     */
    async handleExport(firebaseService = null) {
        await this.viewModel.exportJson(firebaseService);
    }

    /**
     * 处理导入操作
     * @param {File} file - 文件对象
     * @param {FirebaseService} firebaseService - Firebase服务实例
     */
    async handleImport(file, firebaseService = null) {
        const result = await this.viewModel.importJson(file, firebaseService);
        if (result.success) {
            Helpers.alert('导入成功', 'success');
            await this.renderHistory(firebaseService);
        } else {
            Helpers.alert(result.message, 'error');
        }
    }

    /**
     * 处理清空历史记录
     * @param {FirebaseService} firebaseService - Firebase服务实例
     */
    async handleClearHistory(firebaseService = null) {
        const result = await this.viewModel.clearHistory(firebaseService);
        if (result.success) {
            await this.renderHistory(firebaseService);
            Helpers.alert('历史记录已清空', 'success');
        }
    }

    /**
     * 渲染历史记录列表
     * @param {FirebaseService} firebaseService - Firebase服务实例
     */
    async renderHistory(firebaseService = null) {
        const history = await this.viewModel.loadHistory(firebaseService);
        const container = Helpers.getElement('historyContainer');

        if (!history || history.length === 0) {
            container.innerHTML = `<div class="history-item">暂无历史记录</div>`;
            return;
        }

        container.innerHTML = '';
        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            const shortId = item.id ? item.id.slice(-8) : 'N/A';
            div.innerText = `${item.timestamp} | FC:${item.fc} - ${item.location} [${shortId}]`;
            div.onclick = () => {
                Helpers.setElementText('reportOutput', item.report);
            };
            container.appendChild(div);
        });
    }
}