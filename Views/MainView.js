/**
 * 主视图
 * 负责全局DOM操作和阶段切换的UI渲染
 */
class MainView {
    /**
     * 构造函数
     * @param {MainViewModel} viewModel - 视图模型实例
     */
    constructor(viewModel) {
        this.viewModel = viewModel;
    }

    /**
     * 绑定视图模型
     * @param {MainViewModel} vm - 视图模型
     */
    bindViewModel(vm) {
        this.viewModel = vm;
    }

    /**
     * 切换阶段显示
     * @param {number} phase - 阶段编号
     */
    switchPhase(phase) {
        document.querySelectorAll('.phase-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.phase-step').forEach(el => el.classList.remove('active'));

        Helpers.showElement(`phase${phase}Content`);
        Helpers.getElement(`phase${phase}`).classList.add('active');

        document.querySelectorAll('.phase-step').forEach((el, i) => {
            const stepNum = i + 1;
            if (stepNum < phase) {
                el.classList.add('completed');
            } else {
                el.classList.remove('completed');
            }
        });
    }

    /**
     * 重置UI到初始状态
     */
    resetUI() {
        Helpers.setElementValue('fcName', '');
        Helpers.setElementValue('location', '');
        Helpers.setElementValue('fleetType', '');
        Helpers.setElementValue('target', '');
        Helpers.setElementValue('rtbLocation', '');
        Helpers.setElementValue('combatSummary', '');
        Helpers.setElementValue('formImport', '');
        Helpers.setElementValue('rtbImport', '');
        Helpers.setElementValue('kmText', '');
        Helpers.setElementText('kmInfo', '');
        Helpers.setElementText('reportOutput', '');

        const zeroStats = { dps: 0, logi: 0, intercept: 0, scout: 0, electronic: 0 };
        this.updateStatsDisplay(zeroStats);
    }

    /**
     * 更新统计数据显示
     * @param {Object} stats - 各角色数量统计
     */
    updateStatsDisplay(stats) {
        Helpers.setElementText('count_dps', stats.dps);
        Helpers.setElementText('count_logi', stats.logi);
        Helpers.setElementText('count_intercept', stats.intercept);
        Helpers.setElementText('count_scout', stats.scout);
        Helpers.setElementText('count_electronic', stats.electronic);
        Helpers.setElementText('count_total', 0);

        Helpers.setElementText('count_dps_2', 0);
        Helpers.setElementText('count_logi_2', 0);
        Helpers.setElementText('count_intercept_2', 0);
        Helpers.setElementText('count_scout_2', 0);
        Helpers.setElementText('count_electronic_2', 0);
        Helpers.setElementText('count_total_2', 0);
    }
}