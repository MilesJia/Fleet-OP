/**
 * 报告模型类
 * 负责生成和存储PAP作战报告
 */
class Report {
    /**
     * 构造函数
     * @param {FleetOperation} operation - 作战行动实例
     */
    constructor(operation) {
        this.id = operation.id;
        this.battleKey = operation.getBattleKey();
        this.fc = operation.fcName;
        this.location = operation.location;
        this.timestamp = operation.formTime;
        this.fleetType = operation.fleetType;
        this.operation = operation;
        this.reportText = this.generate(); // 自动生成报告
    }

    /**
     * 生成报告文本
     * 根据作战数据生成格式化的PAP报告
     * @returns {string} 报告文本
     */
    generate() {
        const op = this.operation;
        const count = op.getMemberCount();

        // 构建战损名单
        let lossStr = '';
        if (op.lossMembers.length > 0) {
            lossStr += '💀 损失名单：\n';
            op.lossMembers.forEach(m => {
                lossStr += `- ${m.name.padEnd(18)} | ${m.ship.padEnd(14)} | ${m.hasKM ? '有补损' : '无补损'}\n`;
            });
            lossStr += '\n';
        }

        // 构建PAP积分明细
        let papStr = '💰 PAP积分：\n';
        const roleNames = {
            dps: '火力',
            logi: '后勤',
            intercept: '拦截',
            scout: '侦查',
            electronic: '电子'
        };
        const scores = { dps: 1, logi: 2, intercept: 2, scout: 1, electronic: 1 };

        op.formMembers.forEach(m => {
            const role = m.getEffectiveRole();
            const roleText = roleNames[role] || role;
            const score = scores[role] || 0;
            const note = m.isLate ? ' 中途加入' : '';
            papStr += `- ${m.name.padEnd(18)} | ${roleText.padEnd(6)} | ${score}${note}\n`;
        });

        // 构建角色统计
        const roleStats = `📊 编制统计
火力：${count.dps}
后勤：${count.logi}
拦截：${count.intercept}
侦查：${count.scout}
电子：${count.electronic}`;

        // 组合完整报告
        this.reportText = `[PAP] ${op.fleetType}
FC：${op.fcName}
集结：${op.formTime}
回站：${op.rtbTime}
地点：${op.location}
出勤：${op.formMembers.length} 人 | 战损：${op.lossMembers.length} 人

${roleStats}

${lossStr}${papStr}`;

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
     * 序列化为JSON对象
     * @returns {Object} 报告数据对象
     */
    toJSON() {
        return {
            id: this.id,
            battleKey: this.battleKey,
            fc: this.fc,
            location: this.location,
            timestamp: this.timestamp,
            report: this.reportText,
            fleetType: this.fleetType
        };
    }
}