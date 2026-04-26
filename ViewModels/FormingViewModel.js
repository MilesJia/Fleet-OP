/**
 * 集结阶段视图模型
 * 处理集结阶段的所有业务逻辑
 */
class FormingViewModel {
    /**
     * 构造函数
     * @param {FleetOperation} operation - 作战实例
     */
    constructor(operation) {
        this.operation = operation;
        this.onStatsChanged = null;      // 统计变更回调
        this.onMembersChanged = null;     // 成员变更回调
    }

    /**
     * 获取集结成员列表
     * @returns {Array<Member>} 成员数组
     */
    getMembers() {
        return this.operation.formMembers;
    }

    /**
     * 获取成员统计
     * @returns {Object} 各角色数量
     */
    getStats() {
        return this.operation.getMemberCount();
    }

    /**
     * 获取总人数
     * @returns {number} 总人数
     */
    getTotalCount() {
        return this.operation.formMembers.length;
    }

    /**
     * 导入成员
     * @param {string} text - 成员文本
     */
    importMembers(text) {
        this.operation.formMembers = MemberService.parse(text);
        this.notifyStatsChanged();
        this.notifyMembersChanged();
    }

    /**
     * 手动添加成员
     * @param {string} line - 格式：角色名*舰船
     * @returns {boolean} 是否添加成功
     */
    addManualMember(line) {
        const arr = line.split('*').map(i => i.trim()).filter(i => i);
        if (arr.length < 2) {
            Helpers.alert('格式错误：角色名*舰船', 'error');
            return false;
        }
        const member = MemberService.create(arr[0], arr[1]);
        this.operation.formMembers.push(member);
        this.notifyStatsChanged();
        this.notifyMembersChanged();
        return true;
    }

    /**
     * 删除成员
     * @param {number} index - 成员索引
     */
    deleteMember(index) {
        if (index >= 0 && index < this.operation.formMembers.length) {
            this.operation.formMembers.splice(index, 1);
            this.notifyStatsChanged();
            this.notifyMembersChanged();
        }
    }

    /**
     * 更新成员角色
     * @param {number} index - 成员索引
     * @param {string} role - 角色类型
     */
    updateMemberRole(index, role) {
        if (index >= 0 && index < this.operation.formMembers.length) {
            MemberService.updateRole(this.operation.formMembers[index], role);
            this.notifyStatsChanged();
        }
    }

    /**
     * 切换标签选中状态
     * @param {string} tag - 标签名
     */
    toggleTag(tag) {
        const idx = this.operation.tags.indexOf(tag);
        if (idx === -1) {
            this.operation.tags.push(tag);
        } else {
            this.operation.tags.splice(idx, 1);
        }
    }

    /**
     * 检查是否包含标签
     * @param {string} tag - 标签名
     * @returns {boolean} 是否包含
     */
    hasTag(tag) {
        return this.operation.tags.includes(tag);
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
     * 通知成员变更
     */
    notifyMembersChanged() {
        if (this.onMembersChanged) {
            this.onMembersChanged(this.getMembers());
        }
    }

    /**
     * 绑定视图
     * @param {FormingView} view - 视图实例
     */
    bindView(view) {
        this.onStatsChanged = (stats, total) => view.updateStats(stats, total);
        this.onMembersChanged = (members) => view.renderMemberTable(members);
    }
}