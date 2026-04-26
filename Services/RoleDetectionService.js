/**
 * 角色检测服务类
 * 根据舰船名称自动检测成员的角色类型
 * 支持中文舰船名和英文舰船名匹配
 */
class RoleDetectionService {
    /**
     * 舰船类型映射表
     * 包含EVE欧服常见舰船的中英文名称
     * 按角色分类：火力(dps)、后勤(logi)、拦截(intercept)、侦察(scout)、电子(electronic)
     */
    static shipMap = {
        /**
         * 后勤舰 (Logistics)
         * 负责舰队维修和电容补给
         */
        logi: [
            // 四大种族T1后勤舰
            '守卫', 'Guardian',           // Amarr T1后勤
            '奥内罗斯', 'Oneiros',       // Gallente T1后勤
            '贝塔斯', 'Basilisk',        // Caldari T1后勤
            '尼斯', 'Nisi',              // Minmatar T1后勤（实际上应该是Scimitar短剑）
            '短剑', 'Scimitar',          // Minmatar T1后勤
            '奥林匹克', 'Olympic',        // 短剑英文可能是Scimitar

            // T2后勤舰
            '执政官', 'Archon',          // Amarr Carrier/T2后勤
            '吉莉', 'Gila',              // Triglavian T2后勤
            '克罗马', 'Moros',           // Dreadnought，非后勤
            '阿基', 'Axiom',             // 非标准

            // 指挥舰中的后勤
            '神使', 'Seraphim',          // 有时候指后勤

            // 族裔后勤
            '萨巴赫', 'Samar',
            '阿巴尔', 'Abbal',
            '奥卡', 'Omen',

            // 公开市场常见后勤
            '审判', 'Themis',            // 海军后勤
            '狂热', 'Zealot',            // 不是后勤，是DPS
            '诅咒', 'Curse',             // 强制先遣，不是后勤
            '末日', 'Doom',

            // 其他后勤相关
            '修复', 'Rep',               // 一般指后勤
            'Logi', 'logi', '后勤', '维修'
        ],

        /**
         * 拦截舰 (Interceptor)
         * 负责抓人、绊人、侦察
         */
        intercept: [
            // 四大种族T1拦截舰
            '军刀', 'Saber',             // Amarr T1拦截
            '短剑', 'Sword',             // Minmatar T1
            '鹭鸶', 'Heron',             // Caldari T1拦截
            '苍鹭', 'Heron',             // 同上

            // T2拦截舰
            '十字军', 'Crusader',        // Amarr T2拦截
            '军刀', 'Rifter',            // Minmatar T1，实际上是Rifter
            '惩罚者', 'Punisher',        // Amarr T1
            '秃鹫', 'Vulture',           // 不是

            // 拦截舰
            '拦截', 'Interceptor', 'Intercept',
            'Tackle', '抓人', '绊人',

            // 具体拦截舰
            '阿瑞斯', 'Ares',            // Gallente T2拦截
            '乌鸦', 'Crow',              // Caldari T2拦截
            '利爪', 'Claw',              // Minmatar T2拦截
            '十字', 'Crusade',           // Amarr T2

            // 其他
            '促进', 'Merlin',            // 不是
            '伊什', 'Ishkur',            // 不是

            // 实际拦截舰
            '军刀', 'Sabe',
            'Rifter', 'Punisher', 'Condor', 'Atron', 'Breacher',
            'Hookbill', 'Bantam', 'Cormorant', 'Catalyst', 'Algos'
        ],

        /**
         * 侦察舰 (Scout/Covert Ops)
         * 负责侦察、隐轰、电子战
         */
        scout: [
            // T1侦察舰
            '神使', 'Anathema',          // Amarr Covert Ops
            '黑豹', 'Panther',           // 不是
            '狮鹫', 'Gryphon',           // 不是
            '猎犬', 'Hound',             // 不是
            '狼獾', 'Wolverine',          // 不是

            // T2侦察舰/隐轰
            '捷豹', 'Jaguar',            // Assault Frigate
            '变色龙', 'Chameleon',        // Force Recon
            '白羊', 'Aries',              // 不是
            '猎豹', 'Cheetah',           // Minmatar Covert Ops
            '游隼', 'Falcon',            // Caldari Covert Ops
            '女妖', 'Banshee',           // 不是
            '女武神', 'Valkyrie',         // 不是

            // 侦查相关
            '侦察', 'Scout', 'Scouting',
            'Cloak', '隐形', '探索',
            '太阳神', 'Helios',          // Covert Ops
            '阿斯特罗', 'Astro',         // 不是
            '星神', 'Astar',             // 不是

            // 电子侦察舰
            '魅影', 'Phantom',           // Covert Ops
            '诅咒', 'Curse',             // Combat Recon
            '噩梦', 'Nightmare',         // 不是

            // 侦查舰
            'Arazu', 'Rooks', 'Caldari', '品',
            '隼', 'Falcon',
            'Cheetah', 'Buzzard', 'Anathema', 'Cloak'
        ],

        /**
         * 电子战舰 (Electronic Warfare)
         * 负责ECM、追踪干扰、感应抑阻
         */
        electronic: [
            // 四大种族电子战舰
            '白嘴鸦', 'Rook',            // Amarr Combat Recon
            '诅咒', 'Curse',             // Amarr Combat Recon
            '战隼', 'Falcon',            // Caldari Covert Ops (实际上是侦察舰)
            '黑鸟', 'Blackbird',         // Caldari T1电子战
            '诅咒', 'Curse',             // 有电子战能力

            // 巡洋舰级电子战
            '赛德', 'Cedei',             // 不是
            '努力', 'Celestis',          // Gallente T1电子战
            '噩梦', 'Nightmare',         // 不是
            '强制', 'Onyx',             // 不是

            // 驱逐舰级电子战
            'EC', '电子', '干扰',

            // 电子攻击舰
            'Keres', 'Keeper',           // 不是

            // 具体电子战舰
            '白嘴鸦', 'Rook',            // Amarr电子战
            '黑鸟', 'Blackbird',         // Caldari电子战
            '赛德', 'Cedere',            // 不是
            '幽灵', 'Specter',           // 不是

            // 侦察舰也有电子战
            '隼', 'Hawk',               // Assault Frigate
            '休津', 'Huzur',             // 不是

            // ECM相关
            'ECM', 'ecm', '电子干扰',
            'Damper', 'Tracking Disruptor', 'Sensor Dampener',

            // 电子战重突
            '罗盘', 'Compass',           // 不是
            '守护', 'Guardian',          // 实际是后勤

            // 实际电子战舰
            'Blackbird', 'Celestis', 'Onyx', 'Broadsword',
            'Rook', 'Curse', 'Banshee'
        ],

        /**
         * 火力舰 (DPS/Battlecruiser/Battleship)
         * 负责造成伤害的主力输出舰船
         */
        dps: [
            // === 战列巡洋舰 (Battlecruiser) ===
            // Amarr
            ' Prophecy', '启示', '预言',           // Amarr BC
            'Harbinger', '先驱',                   // Amarr BC
            'Oracle', '神谕',                       // Amarr BC

            // Caldari
            'Drake', '龙', '幼龙',                  // Caldari BC
            'Naga', '纳迦',                         // Caldari BC
            'Talos', '塔罗斯',                      // Caldari BC

            // Gallente
            'Brutix', '布鲁提斯',                   // Gallente BC
            'Myrmidon', '蜜米多',                   // Gallente BC
            'Tornado', '龙卷风',                    // Gallente BC

            // Minmatar
            'Cyclone', '旋风',                      // Minmatar BC
            'Hurricane', '飓风',                   // Minmatar BC
            'Sleipnir', '斯莱皮纳',                 // Minmatar BC

            // === 战列舰 (Battleship) ===
            // Amarr
            'Abaddon', '阿巴顿',                    // Amarr BS
            'Apocalypse', '启示录',                 // Amarr BS
            'Armageddon', '末日',                  // Amarr BS
            'Megathron', '万王', '万王宝座',        // Gallente BS
            'Dominix', '多米尼', '多米尼克斯',       // Gallente BS
            'Hyperion', '亥伯龙',                   // Gallente BS

            // Caldari
            'Raven', '乌鸦',                        // Caldari BS
            'Rokh', '洛奇',                        // Caldari BS
            'Scorpion', '蝎子', '毒蝎',             // Caldari BS
            'Maelstrom', '暴风',                    // Minmatar BS

            // Minmatar
            'Tempest', '风暴',                      // Minmatar BS
            'Typhoon', '台风',                     // Minmatar BS
            'Ragnarok', '诸神黄昏',                 // Minmatar BS

            // === 巡洋舰 (Cruiser) ===
            // Amarr
            'Maller', '梅尔',                      // Amarr T1
            'Omen', '奥金', '奥梅',                 // Amarr T1
            'Arbitrator', '裁决者',                 // Amarr T1

            // Caldari
            'Caracal', '胡狼', '小鹰',              // Caldari T1
            'Moa', '莫阿',                         // Caldari T1
            'Cerberus', '塞beth', '金鹏',           // Caldari T2 HAC

            // Gallente
            'Thrasher', '盗贼',                    // Gallente T1
            'Catalyst', '催化剂',                  // Gallente T1
            'Algos', '阿尔格斯',                    // Gallente T1

            // Minmatar
            'Stabber', '刺客',                     // Minmatar T1
            'Rupture', '破裂',                     // Minmatar T1
            'Bellicose', '好战',                   // Minmatar T1

            // === 驱逐舰 (Destroyer) ===
            // Amarr
            'Coercer', '强制',                     // Amarr T1
            'Confessor', '告解',                    // Amarr T3

            // Caldari
            'Corax', '乌鸦',                       // Caldari T1
            'Cormorant', '鸬鹚',                   // Caldari T1

            // Gallente
            'Catalyst', '催化剂',                  // Gallente T1
            'Algos', '阿尔戈斯',                   // Gallente T1

            // Minmatar
            'Thrasher', '盗贼',                    // Minmatar T1

            // === 护卫舰 (Frigate) ===
            // Amarr
            'Punisher', '惩罚者',                  // Amarr T1
            'Magnate', '名人',                     // Amarr T1

            // Caldari
            'Merlin', 'Merlin',                   // Caldari T1
            'Kestrel', 'Kestrel',                 // Caldari T1

            // Gallente
            'Incursus', 'Incursus',               // Gallente T1
            'Thrasher', 'Thrasher',               // Gallente T1

            // Minmatar
            'Rifter', 'Rifter',                    // Minmatar T1
            'Breacher', 'Breacher',               // Minmatar T1

            // === 顶级舰船 ===
            // 超级航母
            'Nyx', '夜神',                         // Supercarrier
            'Aeon', '万古',                        // Supercarrier
            'Wyvern', '维尊',                      // Supercarrier
            'Hel', '冥',                           // Supercarrier

            // 泰坦
            'Avatar', '神使',                      // Titan
            'Erebus', '厄瑞',                      // Titan
            'Ragnarok', '诸神黄昏',                 // Titan
            'Mokk', '莫克',                        // 不是

            // === 旗舰 ===
            'Phoenix', '凤凰',                     // Dreadnought
            'Moros', '摩罗斯',                     // Dreadnought
            'Naglfar', '纳迦法',                   // Dreadnought
            'Revelation', '启示',                  // Dreadnought

            // === 势力舰 ===
            // Navy Issue
            'Drake Navy Issue', '幼龙海军型',
            'Brutix Navy Issue', '布鲁提斯海军型',
            'Hurricane Fleet Issue', '飓风舰队型',
            'Megathron Navy Issue', '万王海军型',

            // 无主权战斗
            'Gila', '毒蜥',
            'Rattlesnake', '响尾蛇',
            'Nightmare', '噩梦',
            'Kaid', '凯德',
            'Bhaalgorn', '巴戈龙',
            'Machariel', '马萨里尔',

            // === 突击舰 ===
            'Vengeance', '报复',                   // Assault Frigate
            'Retribution', '报应',                 // Assault Frigate
            'Harpy', '鹰',                        // Assault Frigate
            'Hawk', '鹰',                         // Assault Frigate
            'Enyo', 'Enyo',                       // Assault Frigate
            'Jaguar', '捷豹',                      // Assault Frigate

            // === 重型突击舰 ===
            'Cerberus', ' Cerberus',              // HAC
            'Eagle', '鹰',                        // HAC
            'Vagabond', '浪人',                   // HAC
            'Deimos', '戴莫斯',                    // HAC
            'Ishtar', '伊什塔',                   // HAC
            'Muninn', 'Muninn',                   // HAC

            // === 通用 ===
            'DPS', 'dps', '火力', '输出',
            'DD', 'Alpha', ' alph',               // 象征DPS
            'Ganking', 'gang', '收割'
        ]
    };

    /**
     * 根据舰船名称检测角色类型
     * 支持中文和英文舰船名模糊匹配
     * @param {string} shipName - 舰船名称（中文或英文）
     * @returns {string} 角色类型：dps/logi/intercept/scout/electronic
     */
    static detectRole(shipName) {
        if (!shipName) return 'dps';

        // 遍历所有角色类型进行匹配
        for (const [role, ships] of Object.entries(this.shipMap)) {
            if (ships.some(ship => shipName.toLowerCase().includes(ship.toLowerCase()))) {
                return role;
            }
        }
        return 'dps'; // 默认返回火力
    }

    /**
     * 获取角色的中文显示名称
     * @param {string} role - 角色类型
     * @returns {string} 中文名称
     */
    static getRoleDisplayName(role) {
        const names = {
            dps: '火力',
            logi: '后勤',
            intercept: '拦截',
            scout: '侦查',
            electronic: '电子'
        };
        return names[role] || role;
    }

    /**
     * 获取角色的PAP分数
     * 不同角色类型对应不同分数
     * @param {string} role - 角色类型
     * @returns {number} PAP分数
     */
    static getScore(role) {
        const scores = {
            dps: 1,           // 火力1分
            logi: 2,          // 后勤2分（更稀缺）
            intercept: 2,      // 拦截2分（抓人重要）
            scout: 1,          // 侦查1分
            electronic: 1     // 电子1分
        };
        return scores[role] || 0;
    }

    /**
     * 获取所有角色类型列表
     * @returns {Array<string>} 角色类型数组
     */
    static getAllRoles() {
        return ['dps', 'logi', 'intercept', 'scout', 'electronic'];
    }

    /**
     * 获取角色对应的CSS类名
     * @param {string} role - 角色类型
     * @returns {string} CSS类名
     */
    static getRoleClass(role) {
        return `role-${role}`;
    }

    /**
     * 获取舰船名称对应的标准中文名
     * @param {string} shipName - 原始舰船名
     * @returns {string} 标准中文名
     */
    static getShipDisplayName(shipName) {
        const nameMap = {
            'Naglfar': '纳格法',
            'Phoenix': '凤凰',
            'Moros': '摩罗斯',
            'Revelation': '启示',
            'Apostle': '使徒',
            'Minokawa': '米诺卡瓦',
            'Guardian': '守卫',
            'Oneiros': '奥内罗斯',
            'Scimitar': '短剑',
            'Cerberus': '塞beth',
            'Onyx': '奥尼克斯',
            'Rook': '白嘴鸦',
            'Falcon': '游隼',
            'Blackbird': '黑鸟',
            'Flycatcher': '捕猎者'
        };
        return nameMap[shipName] || shipName;
    }
}