/**
 * 存储服务类
 * 负责存储相关的操作，支持Firebase和LocalStorage两种模式
 */
class StorageService {
    /** localStorage的键名 */
    static HISTORY_KEY = 'papReportHistory';
    
    /**
     * 保存报告历史
     * @param {Array} reports - 报告数组
     * @param {FirebaseService} firebaseService - Firebase服务实例
     * @returns {Promise<boolean>} 是否保存成功
     */
    static async saveReportHistory(reports, firebaseService = null) {
        try {
            if (firebaseService && firebaseService.getCurrentUser()) {
                // 使用Firebase保存
                for (const report of reports) {
                    await firebaseService.saveOperation(report);
                }
                return true;
            } else {
                // 使用LocalStorage保存
                localStorage.setItem(this.HISTORY_KEY, JSON.stringify(reports));
                return true;
            }
        } catch (e) {
            console.error('保存历史记录失败:', e);
            return false;
        }
    }

    /**
     * 加载报告历史
     * @param {FirebaseService} firebaseService - Firebase服务实例
     * @returns {Promise<Array>} 报告历史数组
     */
    static async loadReportHistory(firebaseService = null) {
        try {
            if (firebaseService && firebaseService.getCurrentUser()) {
                // 从Firebase加载
                return await firebaseService.getOperations();
            } else {
                // 从LocalStorage加载
                const data = localStorage.getItem(this.HISTORY_KEY);
                return data ? JSON.parse(data) : [];
            }
        } catch (e) {
            console.error('加载历史记录失败:', e);
            return [];
        }
    }

    /**
     * 添加报告到历史记录
     * @param {Report} report - 报告实例
     * @param {FirebaseService} firebaseService - Firebase服务实例
     * @returns {Promise<Object>} 操作结果 {success, message}
     */
    static async addReport(report, firebaseService = null) {
        const history = await this.loadReportHistory(firebaseService);
        const exists = history.some(x => x.battleKey === report.battleKey);
        if (exists) {
            return { success: false, message: '本场已保存，不可重复保存' };
        }
        
        const reportData = report.toJSON();
        
        if (firebaseService && firebaseService.getCurrentUser()) {
            // 使用Firebase保存
            try {
                await firebaseService.saveOperation(reportData);
                return { success: true, message: '保存成功' };
            } catch (error) {
                return { success: false, message: error.message };
            }
        } else {
            // 使用LocalStorage保存
            history.unshift(reportData);
            await this.saveReportHistory(history, firebaseService);
            return { success: true, message: '保存成功' };
        }
    }

    /**
     * 清空所有历史记录
     * @param {FirebaseService} firebaseService - Firebase服务实例
     * @returns {Promise<boolean>} 是否成功
     */
    static async clearHistory(firebaseService = null) {
        try {
            if (firebaseService && firebaseService.getCurrentUser()) {
                // 清空Firebase中的记录
                const operations = await firebaseService.getOperations();
                for (const op of operations) {
                    await firebaseService.deleteOperation(op.id);
                }
                return true;
            } else {
                // 清空LocalStorage
                localStorage.setItem(this.HISTORY_KEY, '[]');
                return true;
            }
        } catch (e) {
            console.error('清空历史记录失败:', e);
            return false;
        }
    }

    /**
     * 导出历史记录为JSON文件
     * @param {FirebaseService} firebaseService - Firebase服务实例
     */
    static async exportToJson(firebaseService = null) {
        const data = await this.loadReportHistory(firebaseService);
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
     * @param {FirebaseService} firebaseService - Firebase服务实例
     * @returns {Promise<Object>} 操作结果
     */
    static importFromJson(file, firebaseService = null) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async e => {
                try {
                    const data = JSON.parse(e.target.result);
                    await this.saveReportHistory(data, firebaseService);
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