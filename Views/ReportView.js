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
     */
    handleSave() {
        const result = this.viewModel.save();
        Helpers.alert(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            this.renderHistory();
        }
    }

    /**
     * 处理导出操作
     */
    handleExport() {
        this.viewModel.exportJson();
    }

    /**
     * 处理导入操作
     * @param {File} file - 文件对象
     */
    async handleImport(file) {
        const result = await this.viewModel.importJson(file);
        if (result.success) {
            Helpers.alert('导入成功', 'success');
            this.renderHistory();
        } else {
            Helpers.alert(result.message, 'error');
        }
    }

    /**
     * 处理清空历史记录
     */
    handleClearHistory() {
        const result = this.viewModel.clearHistory();
        if (result.success) {
            this.renderHistory();
            Helpers.alert('历史记录已清空', 'success');
        }
    }

    /**
     * 渲染历史记录列表
     */
    renderHistory() {
        const history = this.viewModel.loadHistory();
        const container = Helpers.getElement('historyContainer');

        if (!history || history.length === 0) {
            container.innerHTML = `<div class="history-item">暂无历史记录</div>`;
            return;
        }

        container.innerHTML = '';
        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            const shortId = item.id.slice(-8);
            div.innerText = `${item.timestamp} | FC:${item.fc} - ${item.location} [${shortId}]`;
            div.onclick = () => {
                Helpers.setElementText('reportOutput', item.report);
            };
            container.appendChild(div);
        });
    }
}