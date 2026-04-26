/**
 * 回站阶段视图模型
 * 处理回站阶段的所有业务逻辑
 */
class RTBViewModel {
    /**
     * 构造函数
     * @param {FleetOperation} operation - 作战实例
     */
    constructor(operation) {
        this.operation = operation;
        this.onStatsChanged = null;        // 统计变更回调
        this.onLossPanelChanged = null;     // 战损面板变更回调
        this.onKMInfoChanged = null;         // KM信息变更回调
    }

    /**
     * 获取回站成员列表
     * @returns {Array<Member>} 成员数组
     */
    getMembers() {
        return this.operation.rtbMembers;
    }

    /**
     * 获取战损成员列表
     * @returns {Array<Member>} 战损数组
     */
    getLossMembers() {
        return this.operation.lossMembers;
    }

    /**
     * 获取成员统计
     * @returns {Object} 各角色数量
     */
    getStats() {
        const count = { dps: 0, logi: 0, intercept: 0, scout: 0, electronic: 0 };
        this.operation.rtbMembers.forEach(m => {
            const role = m.getEffectiveRole();
            if (count.hasOwnProperty(role)) {
                count[role]++;
            }
        });
        return count;
    }

    /**
     * 获取总人数
     * @returns {number} 总人数
     */
    getTotalCount() {
        return this.operation.rtbMembers.length;
    }

    /**
     * 导入回站成员
     * @param {string} text - 成员文本
     */
    importMembers(text) {
        this.operation.rtbMembers = MemberService.parse(text);
        this.calculateLosses();
        this.notifyStatsChanged();
    }

    /**
     * 计算战损
     */
    calculateLosses() {
        this.operation.calculateLosses();
        this.notifyLossPanelChanged();
    }

    /**
     * 解析击杀邮件
     * @param {string} text - KM文本
     * @returns {number} 匹配数量
     */
    parseKM(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const matched = ReportService.matchKillmails(this.operation.lossMembers, lines);
        this.notifyKMInfoChanged(matched);
        return matched;
    }

    /**
     * 获取KM信息文本
     * @returns {string} KM信息
     */
    getKMInfo() {
        const total = this.operation.lossMembers.length;
        const matched = this.operation.lossMembers.filter(m => m.hasKM).length;
        return `匹配到 ${matched}/${total} 条KM`;
    }

    /**
     * 通知统计变更
     */
    notifyStatsChanged() {
        if (this.onStatsChanged) {
            this.onStatsChanged(this.getStats(), this.getTotalCount());
        }
    }

    /**
     * 通知战损面板变更
     */
    notifyLossPanelChanged() {
        if (this.onLossPanelChanged) {
            this.onLossPanelChanged(this.operation.lossMembers.length > 0, this.getLossMembers());
        }
    }

    /**
     * 通知KM信息变更
     * @param {number} matched - 匹配数量
     */
    notifyKMInfoChanged(matched) {
        if (this.onKMInfoChanged) {
            this.onKMInfoChanged(this.getKMInfo());
        }
    }

    /**
     * 绑定视图
     * @param {RTBView} view - 视图实例
     */
    bindView(view) {
        this.onStatsChanged = (stats, total) => view.updateStats(stats, total);
        this.onLossPanelChanged = (show, losses) => view.toggleLossPanel(show);
        this.onKMInfoChanged = (info) => view.updateKMInfo(info);
    }
}