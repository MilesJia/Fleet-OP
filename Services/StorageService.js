/**
 * 存储服务类
 * 负责本地存储相关的操作，包括历史记录的保存、加载、导入导出
 */
class StorageService {
    /** localStorage的键名 */
    static HISTORY_KEY = 'papReportHistory';

    /**
     * 保存报告历史到localStorage
     * @param {Array} reports - 报告数组
     * @returns {boolean} 是否保存成功
     */
    static saveReportHistory(reports) {
        try {
            localStorage.setItem(this.HISTORY_KEY, JSON.stringify(reports));
            return true;
        } catch (e) {
            console.error('保存历史记录失败:', e);
            return false;
        }
    }

    /**
     * 从localStorage加载报告历史
     * @returns {Array} 报告历史数组
     */
    static loadReportHistory() {
        try {
            const data = localStorage.getItem(this.HISTORY_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('加载历史记录失败:', e);
            return [];
        }
    }

    /**
     * 添加报告到历史记录
     * @param {Report} report - 报告实例
     * @returns {Object} 操作结果 {success, message}
     */
    static addReport(report) {
        const history = this.loadReportHistory();
        const exists = history.some(x => x.battleKey === report.battleKey);
        if (exists) {
            return { success: false, message: '本场已保存，不可重复保存' };
        }
        history.unshift(report.toJSON());
        this.saveReportHistory(history);
        return { success: true, message: '保存成功' };
    }

    /**
     * 清空所有历史记录
     * @returns {boolean} 是否成功
     */
    static clearHistory() {
        localStorage.setItem(this.HISTORY_KEY, '[]');
        return true;
    }

    /**
     * 导出历史记录为JSON文件
     */
    static exportToJson() {
        const data = this.loadReportHistory();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PAP历史_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * 从JSON文件导入历史记录
     * @param {File} file - 文件对象
     * @returns {Promise<Object>} 操作结果
     */
    static importFromJson(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.saveReportHistory(data);
                    resolve({ success: true, data });
                } catch {
                    reject({ success: false, message: '格式错误' });
                }
            };
            reader.onerror = () => reject({ success: false, message: '读取文件失败' });
            reader.readAsText(file);
        });
    }
}