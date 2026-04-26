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
            lossStr += '损失名单：\n';
            op.lossMembers.forEach(m => {
                lossStr += `- ${m.name.padEnd(18)} | ${m.ship.padEnd(14)} | ${m.hasKM ? '有补损' : '无补损'}\n`;
            });
            lossStr += '\n';
        }

        // 构建PAP积分明细
        let papStr = 'PAP积分：\n';
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
        const roleStats = `编制统计
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
     * 生成EVE格式的彩色报告文本
     * 用于在EVE游戏内聊天频道显示
     * @returns {string} EVE格式彩色报告文本
     */
    generateEVE() {
        const op = this.operation;
        const count = op.getMemberCount();

        // EVE颜色定义
        const colors = {
            title: '0x00BFFF',    // 天蓝色 - 标题
            header: '0x00FFFF',   // 青色 - 表头
            label: '0xFFFF00',    // 黄色 - 标签
            name: '0xFFFFFF',      // 白色 - 名称
            value: '0x00FF00',     // 绿色 - 数值
            loss: '0xFF0000',     // 红色 - 战损
            pap: '0xFFD700',      // 金色 - PAP积分
            stat: '0xFFFFFF',     // 白色 - 统计
            late: '0xFFA500'     // 橙色 - 中途加入
        };

        // EVE颜色标签辅助函数
        const c = (color, text) => `<color=${color}>${text}</color>`;

        // 构建战损名单
        let lossStr = '';
        if (op.lossMembers.length > 0) {
            lossStr += c(colors.loss, '损失名单：') + '\n';
            op.lossMembers.forEach(m => {
                lossStr += `- ${m.name.padEnd(18)} | ${m.ship.padEnd(14)} | ${m.hasKM ? '有补损' : '无补损'}\n`;
            });
            lossStr += '\n';
        }

        // 构建PAP积分明细
        let papStr = c(colors.pap, 'PAP积分：') + '\n';
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
            const note = m.isLate ? c(colors.late, ' 中途加入') : '';
            papStr += `- ${m.name.padEnd(18)} | ${roleText.padEnd(6)} | ${c(colors.value, score)}${note}\n`;
        });

        // 构建角色统计
        const roleStats = `${c(colors.header, '编制统计')}
${c(colors.label, '火力：')}${c(colors.value, count.dps)}
${c(colors.label, '后勤：')}${c(colors.value, count.logi)}
${c(colors.label, '拦截：')}${c(colors.value, count.intercept)}
${c(colors.label, '侦查：')}${c(colors.value, count.scout)}
${c(colors.label, '电子：')}${c(colors.value, count.electronic)}`;

        // 组合完整EVE格式报告
        const eveReport = `${c(colors.title, '[PAP]')} ${op.fleetType}
${c(colors.label, 'FC：')}${c(colors.name, op.fcName)}
${c(colors.label, '集结：')}${c(colors.value, op.formTime)}
${c(colors.label, '回站：')}${c(colors.value, op.rtbTime)}
${c(colors.label, '地点：')}${c(colors.name, op.location)}
${c(colors.label, '出勤：')}${c(colors.value, op.formMembers.length)} 人 ${c(colors.label, '| 战损：')}${c(colors.loss, op.lossMembers.length)} 人

${roleStats}

${lossStr}${papStr}`;

        return eveReport;
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