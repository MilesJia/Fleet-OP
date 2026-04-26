/**
 * 报告服务类
 * 提供报告生成、复制、击杀邮件匹配等功能
 */
class ReportService {
    /**
     * 生成报告文本
     * @param {FleetOperation} operation - 作战实例
     * @returns {string} 报告文本
     */
    static generate(operation) {
        const report = new Report(operation);
        return report.generate();
    }

    /**
     * 复制文本到剪贴板
     * @param {string} text - 要复制的文本
     * @returns {Promise<Object>} 操作结果
     */
    static async copyToClipboard(text) {
        if (!text) {
            return { success: false, message: '报告为空，无法复制' };
        }
        try {
            await navigator.clipboard.writeText(text);
            return { success: true, message: '复制成功' };
        } catch (e) {
            return { success: false, message: '复制失败: ' + e.message };
        }
    }

    /**
     * 匹配击杀邮件与战损成员
     * @param {Array<Member>} lossMembers - 战损成员列表
     * @param {Array<string>} kmLines - KM链接数组
     * @returns {number} 匹配成功的数量
     */
    static matchKillmails(lossMembers, kmLines) {
        let matched = 0;
        kmLines.forEach(line => {
            line = line.trim();
            if (!line) return;

            let name = null;
            // 从zKillboard链接中提取角色名
            if (line.includes('zkillboard.com/character/')) {
                const parts = line.split('/character/');
                if (parts[1]) {
                    name = parts[1].split('/')[0];
                }
            }

            if (name) {
                const target = lossMembers.find(m =>
                    m.name.toLowerCase().includes(name.toLowerCase())
                );
                if (target) {
                    target.hasKM = true;
                    matched++;
                }
            }
        });
        return matched;
    }
}