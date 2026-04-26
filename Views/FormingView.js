/**
 * 集结阶段视图
 * 负责集结阶段的DOM操作和UI渲染
 */
class FormingView {
    /**
     * 构造函数
     * @param {FormingViewModel} viewModel - 视图模型实例
     */
    constructor(viewModel) {
        this.viewModel = viewModel;
        this.viewModel.bindView(this);
    }

    /**
     * 更新统计数据展示
     * @param {Object} stats - 各角色数量统计
     * @param {number} total - 总人数
     */
    updateStats(stats, total) {
        Helpers.setElementText('count_dps', stats.dps);
        Helpers.setElementText('count_logi', stats.logi);
        Helpers.setElementText('count_intercept', stats.intercept);
        Helpers.setElementText('count_scout', stats.scout);
        Helpers.setElementText('count_electronic', stats.electronic);
        Helpers.setElementText('count_total', total);
    }

    /**
     * 渲染成员表格
     * @param {Array<Member>} members - 成员数组
     */
    renderMemberTable(members) {
        let html = `<table class="member-table"><tr><th>${i18nService.t('form.memberId')}</th><th>${i18nService.t('form.ship')}</th><th>${i18nService.t('form.autoRole')}</th><th>${i18nService.t('form.manualRole')}</th><th>${i18nService.t('form.action')}</th></tr>`;

        members.forEach((m, i) => {
            const role = m.getEffectiveRole();
            const roleDisplay = RoleDetectionService.getRoleDisplayName(role);
            const roleClass = RoleDetectionService.getRoleClass(role);

            html += `<tr>
                <td>${m.name}</td>
                <td>${m.ship}</td>
                <td class="${roleClass}">${roleDisplay}</td>
                <td><select class="role-select" onchange="app.formingVM.updateMemberRole(${i}, this.value)">
                    <option value="" ${!m.manual ? 'selected' : ''}>${i18nService.t('form.auto')}</option>
                    <option value="dps" ${role === 'dps' ? 'selected' : ''}>${i18nService.t('roles.dps')}</option>
                    <option value="logi" ${role === 'logi' ? 'selected' : ''}>${i18nService.t('roles.logi')}</option>
                    <option value="intercept" ${role === 'intercept' ? 'selected' : ''}>${i18nService.t('roles.intercept')}</option>
                    <option value="scout" ${role === 'scout' ? 'selected' : ''}>${i18nService.t('roles.scout')}</option>
                    <option value="electronic" ${role === 'electronic' ? 'selected' : ''}>${i18nService.t('roles.electronic')}</option>
                </select></td>
                <td><button class="btn-danger" onclick="app.deleteMember(${i})"><i class="fas fa-trash"></i> ${i18nService.t('buttons.delete')}</button></td>
            </tr>`;
        });

        html += '</table>';
        Helpers.getElement('memberTableContainer').innerHTML = html;
    }

    /**
     * 显示成员编辑面板
     */
    showMemberPanel() {
        Helpers.showElement('memberEditPanel');
    }

    /**
     * 隐藏成员编辑面板
     */
    hideMemberPanel() {
        Helpers.hideElement('memberEditPanel');
    }

    /**
     * 获取导入文本
     * @returns {string} 导入文本
     */
    getImportText() {
        return Helpers.getElementValue('formImport');
    }

    /**
     * 清空导入文本
     */
    clearImport() {
        Helpers.setElementValue('formImport', '');
    }
}