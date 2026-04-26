/**
 * 常量定义
 * 包含应用程序中使用的所有常量配置
 */
const Constants = {
    /** PAP各角色对应的分数 */
    PAP_SCORE: { dps: 1, logi: 2, intercept: 2, scout: 1, electronic: 1 },

    /** 舰队类型选项列表 */
    FLEET_TYPES: [
        { value: 'CTA', label: '联盟集结(CTA)' },
        { value: 'StratOp', label: '战略行动(StratOp)' },
        { value: 'Home Defense', label: '本土防御(Home Defense)' },
        { value: 'Roaming', label: '漫游扫荡(Roaming)' },
        { value: 'Mining', label: '矿业开采(Mining)' },
        { value: 'Other', label: '其他行动(Other)' }
    ],

    /** 快捷标签选项 */
    TAG_OPTIONS: ['PAP', 'CTA', 'StratOp', 'SRP', 'NoSRP', 'T1', 'T2', 'T3'],

    /** 阶段枚举 */
    PHASES: {
        FORMING: 1,  // 集结阶段
        RTB: 2,      // 回站阶段
        REPORT: 3     // 报告阶段
    },

    /** localStorage键名 */
    STORAGE_KEYS: {
        REPORT_HISTORY: 'papReportHistory'
    },

    /** CSS类名常量 */
    CSS_CLASSES: {
        ROLE_PREFIX: 'role-',           // 角色CSS类名前缀
        PHASE_ACTIVE: 'active',         // 激活阶段样式
        PHASE_COMPLETED: 'completed'    // 已完成阶段样式
    }
};