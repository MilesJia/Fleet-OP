/**
 * 
 * 成员服务类
 * 提供成员相关的操作，包括解析、创建、统计等功能
 */
class MemberService {
    /**
     * 解析文本为成员列表
     * 格式：角色名*舰船（每行一条）
     * @param {string} text - 输入文本
     * @returns {Array<Member>} 成员数组
     */
    static parse(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const members = [];

        lines.forEach(line => {
            const arr = line.split('*').map(i => i.trim()).filter(Boolean);
            if (arr.length < 2) return;

            const left = arr[0];
            const ship = arr[1];
            const name = left.split(' ').slice(0, -1).join(' ') || left;
            const role = RoleDetectionService.detectRole(ship);

            members.push(new Member(name, ship, role));
        });

        return members;
    }

    /**
     * 手动创建成员
     * @param {string} name - 成员名称
     * @param {string} ship - 舰船名称
     * @returns {Member} 成员实例
     */
    static create(name, ship) {
        const role = RoleDetectionService.detectRole(ship);
        const member = new Member(name, ship, role);
        member.isLate = true;
        return member;
    }

    /**
     * 更新成员角色
     * @param {Member} member - 成员实例
     * @param {string} role - 角色类型
     */
    static updateRole(member, role) {
        member.setManualRole(role);
    }

    /**
     * 计算成员统计
     * @param {Array<Member>} members - 成员数组
     * @returns {Object} 各角色数量统计
     */
    static calculateStats(members) {
        const count = { dps: 0, logi: 0, intercept: 0, scout: 0, electronic: 0 };
        members.forEach(m => {
            const role = m.getEffectiveRole();
            if (count.hasOwnProperty(role)) {
                count[role]++;
            }
        });
        return count;
    }
}