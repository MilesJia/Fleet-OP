/**
 * 成员模型类
 * 表示参与作战的单个成员信息
 */
class Member {
    /**
     * 构造函数
     * @param {string} name - 成员名称
     * @param {string} ship - 舰船名称
     * @param {string} role - 自动检测的角色类型，默认dps
     */
    constructor(name, ship, role = 'dps') {
        this.name = name;
        this.ship = ship;
        this.role = role;
        this.manual = null;       // 手动设置的角色，优先于自动检测
        this.hasKM = false;       // 是否有击杀邮件
        this.isLate = false;      // 是否中途加入
    }

    /**
     * 获取实际生效的角色
     * 优先返回手动设置的角色，否则返回自动检测的角色
     * @returns {string} 角色类型
     */
    getEffectiveRole() {
        return this.manual || this.role;
    }

    /**
     * 设置手动角色
     * @param {string} role - 角色类型，传入空则清除手动设置
     */
    setManualRole(role) {
        this.manual = role || null;
    }

    /**
     * 获取PAP积分
     * 根据角色类型返回对应的分数
     * @returns {number} PAP分数
     */
    getScore() {
        const role = this.getEffectiveRole();
        return {
            dps: 1,        // 火力舰：1分
            logi: 2,       // 后勤舰：2分
            intercept: 2,  // 拦截舰：2分
            scout: 1,      // 侦查舰：1分
            electronic: 1   // 电子舰：1分
        }[role] || 0;
    }

    /**
     * 序列化为JSON对象
     * @returns {Object} 成员数据对象
     */
    toJSON() {
        return {
            name: this.name,
            ship: this.ship,
            role: this.role,
            manual: this.manual,
            hasKM: this.hasKM,
            isLate: this.isLate
        };
    }

    /**
     * 从JSON对象反序列化
     * @param {Object} data - JSON数据对象
     * @returns {Member} 成员实例
     */
    static fromJSON(data) {
        const member = new Member(data.name, data.ship, data.role);
        member.manual = data.manual;
        member.hasKM = data.hasKM;
        member.isLate = data.isLate;
        return member;
    }
}