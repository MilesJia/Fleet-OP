/**
 * 主视图模型
 * 管理整个应用的状态和各阶段视图模型的协调
 */
class MainViewModel {
    /**
     * 构造函数
     */
    constructor() {
        this.currentPhase = Constants.PHASES.FORMING;  // 当前阶段
        this.operation = new FleetOperation();         // 作战实例
        this.formingVM = new FormingViewModel(this.operation);      // 集结阶段VM
        this.rtbVM = new RTBViewModel(this.operation);             // 回站阶段VM
        this.reportVM = new ReportViewModel(this.operation);      // 报告阶段VM
        this.onPhaseChanged = null;  // 阶段变更回调
    }

    /**
     * 初始化
     */
    init() {
        this.operation.formTime = Helpers.getTime();
    }

    /**
     * 切换阶段
     * @param {number} phase - 阶段编号
     */
    switchPhase(phase) {
        this.currentPhase = phase;
        if (this.onPhaseChanged) {
            this.onPhaseChanged(phase);
        }
    }

    /**
     * 完成当前阶段
     * 推进到下一个阶段
     */
    completeCurrentPhase() {
        if (this.currentPhase === Constants.PHASES.FORMING) {
            this.operation.rtbTime = Helpers.getTime();
            this.switchPhase(Constants.PHASES.RTB);
        } else if (this.currentPhase === Constants.PHASES.RTB) {
            this.reportVM.generate();
            this.switchPhase(Constants.PHASES.REPORT);
        }
    }

    /**
     * 重置所有数据
     */
    resetAll() {
        if (!Helpers.confirm(i18nService.t('alerts.confirmReset'))) return;

        this.operation = new FleetOperation();
        this.operation.formTime = Helpers.getTime();

        this.formingVM = new FormingViewModel(this.operation);
        this.rtbVM = new RTBViewModel(this.operation);
        this.reportVM = new ReportViewModel(this.operation);

        this.currentPhase = Constants.PHASES.FORMING;
    }

    /**
     * 更新作战信息
     * @param {Object} data - 要更新的数据
     */
    updateOperationInfo(data) {
        if (data.fcName !== undefined) this.operation.fcName = data.fcName;
        if (data.location !== undefined) this.operation.location = data.location;
        if (data.fleetType !== undefined) this.operation.fleetType = data.fleetType;
        if (data.target !== undefined) this.operation.target = data.target;
        if (data.rtbLocation !== undefined) this.operation.rtbLocation = data.rtbLocation;
        if (data.combatSummary !== undefined) this.operation.combatSummary = data.combatSummary;
    }

    /**
     * 绑定所有视图
     * @param {FormingView} formingView - 集结视图
     * @param {RTBView} rtbView - 回站视图
     * @param {ReportView} reportView - 报告视图
     * @param {MainView} mainView - 主视图
     */
    bindViews(formingView, rtbView, reportView, mainView) {
        this.formingVM.bindView(formingView);
        this.rtbVM.bindView(rtbView);
        this.reportVM.bindView(reportView);

        this.onPhaseChanged = (phase) => mainView.switchPhase(phase);
        mainView.bindViewModel(this);
    }
}