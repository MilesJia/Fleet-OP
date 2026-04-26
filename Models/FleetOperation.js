/**
 * 作战行动模型类
 * 表示一次完整的作战行动，包括集结、回站、战损等所有信息
 */
class FleetOperation {
    /**
     * 构造函数 - 初始化所有属性
     */
    constructor() {
        this.id = '';              // 唯一标识符
        this.fcName = '';          // 舰队指挥名称
        this.location = '';        // 集结地点
        this.fleetType = '';       // 舰队类型(CTA/StratOp等)
        this.target = '';          // 预期目标
        this.formTime = '';        // 集结时间
        this.rtbTime = '';         // 回站时间
        this.rtbLocation = '';     // 返回地点
        this.combatSummary = '';   // 作战摘要
        this.tags = [];            // 快捷标签数组
        this.formMembers = [];     // 集结成员列表
        this.rtbMembers = [];      // 回站成员列表
        this.lossMembers = [];     // 战损成员列表
    }

    /**
     * 工厂方法 - 创建新的作战实例
     * @param {string} fcName - 指挥官名称
     * @param {string} location - 集结地点
     * @param {string} fleetType - 舰队类型
     * @returns {FleetOperation} 新的作战实例
     */
    static create(fcName, location, fleetType) {
        const op = new FleetOperation();
        op.id = FleetOperation.generateUniqueId(fcName, location);
        op.fcName = fcName;
        op.location = location;
        op.fleetType = fleetType;
        return op;
    }

    /**
     * 生成唯一ID
     * 格式：FC名-地点-时间戳随机数
     * @param {string} fc - 指挥官名称
     * @param {string} loc - 地点
     * @returns {string} 唯一标识符
     */
    static generateUniqueId(fc, loc) {
        const fcPart = fc || 'unknown';
        const locPart = loc || 'unknown';
        const time = Date.now().toString(36);
        const rand = Math.random().toString(36).slice(2, 6);
        return `${fcPart}-${locPart}-${time}${rand}`;
    }

    /**
     * 获取战斗唯一标识键
     * 用于判断是否为同一场战斗
     * @returns {string} 战斗键
     */
    getBattleKey() {
        return `${this.fcName.trim()}|${this.location.trim()}|${this.formTime}`;
    }

    /**
     * 获取成员统计
     * 统计各角色的成员数量
     * @returns {Object} 各角色数量统计
     */
    getMemberCount() {
        const count = { dps: 0, logi: 0, intercept: 0, scout: 0, electronic: 0 };
        this.formMembers.forEach(m => {
            const role = m.getEffectiveRole();
            if (count.hasOwnProperty(role)) {
                count[role]++;
            }
        });
        return count;
    }

    /**
     * 计算战损名单
     * 通过对比集结名单和回站名单，找出未回站的成员
     * @returns {Array} 战损成员列表
     */
    calculateLosses() {
        const rtbNames = this.rtbMembers.map(m => m.name.toLowerCase());
        this.lossMembers = this.formMembers.filter(m => !rtbNames.includes(m.name.toLowerCase()));
        return this.lossMembers;
    }

    /**
     * 序列化为JSON对象
     * @returns {Object} 作战数据对象
     */
    toJSON() {
        return {
            id: this.id,
            fcName: this.fcName,
            location: this.location,
            fleetType: this.fleetType,
            target: this.target,
            formTime: this.formTime,
            rtbTime: this.rtbTime,
            rtbLocation: this.rtbLocation,
            combatSummary: this.combatSummary,
            tags: this.tags,
            formMembers: this.formMembers.map(m => m.toJSON()),
            rtbMembers: this.rtbMembers.map(m => m.toJSON()),
            lossMembers: this.lossMembers.map(m => m.toJSON())
        };
    }

    /**
     * 从JSON对象反序列化
     * @param {Object} data - JSON数据对象
     * @returns {FleetOperation} 作战实例
     */
    static fromJSON(data) {
        const op = new FleetOperation();
        op.id = data.id;
        op.fcName = data.fcName;
        op.location = data.location;
        op.fleetType = data.fleetType;
        op.target = data.target;
        op.formTime = data.formTime;
        op.rtbTime = data.rtbTime;
        op.rtbLocation = data.rtbLocation;
        op.combatSummary = data.combatSummary;
        op.tags = data.tags || [];
        op.formMembers = (data.formMembers || []).map(m => Member.fromJSON(m));
        op.rtbMembers = (data.rtbMembers || []).map(m => Member.fromJSON(m));
        op.lossMembers = (data.lossMembers || []).map(m => Member.fromJSON(m));
        return op;
    }
}