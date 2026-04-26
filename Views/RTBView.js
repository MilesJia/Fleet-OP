/**
 * 回站阶段视图
 * 负责回站阶段的DOM操作和UI渲染
 */
class RTBView {
    /**
     * 构造函数
     * @param {RTBViewModel} viewModel - 视图模型实例
     */
    constructor(viewModel) {
        this.viewModel = viewModel;
        this.viewModel.bindView(this);
    }

    /**
     * 更新统计数据展示
     * @param {Object} stats - 各角色数量统计
     * @param {number} total - 总人数
     */
    updateStats(stats, total) {
        Helpers.setElementText('count_dps_2', stats.dps);
        Helpers.setElementText('count_logi_2', stats.logi);
        Helpers.setElementText('count_intercept_2', stats.intercept);
        Helpers.setElementText('count_scout_2', stats.scout);
        Helpers.setElementText('count_electronic_2', stats.electronic);
        Helpers.setElementText('count_total_2', total);
    }

    /**
     * 切换战损面板显示状态
     * @param {boolean} show - 是否显示
     */
    toggleLossPanel(show) {
        if (show) {
            Helpers.showElement('lossRegisterPanel');
        } else {
            Helpers.hideElement('lossRegisterPanel');
        }
    }

    /**
     * 更新KM信息展示
     * @param {string} info - KM信息文本
     */
    updateKMInfo(info) {
        Helpers.setElementText('kmInfo', info);
    }

    /**
     * 获取回站导入文本
     * @returns {string} 导入文本
     */
    getImportText() {
        return Helpers.getElementValue('rtbImport');
    }

    /**
     * 获取KM文本
     * @returns {string} KM文本
     */
    getKMText() {
        return Helpers.getElementValue('kmText');
    }

    /**
     * 清空KM文本
     */
    clearKMText() {
        Helpers.setElementValue('kmText', '');
    }
}