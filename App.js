/**
 * 应用入口类
 * 协调所有视图模型和视图，负责全局事件处理和页面初始化
 */
class App {
    /**
     * 构造函数 - 初始化所有视图模型和视图实例
     */
    constructor() {
        this.mainVM = new MainViewModel();                    // 主视图模型
        this.mainView = new MainView(this.mainVM);           // 主视图
        this.formingView = new FormingView(this.mainVM.formingVM);   // 集结阶段视图
        this.rtbView = new RTBView(this.mainVM.rtbVM);               // 回站阶段视图
        this.reportView = new ReportView(this.mainVM.reportVM);      // 报告阶段视图
        this.tags = [];  // 当前选中的标签
    }

    /**
     * 初始化应用
     * 设置事件监听、绑定视图、加载历史记录
     */
    async init() {
        this.mainVM.init();
        this.mainVM.bindViews(this.formingView, this.rtbView, this.reportView, this.mainView);
        this.setupEventListeners();
        await this.loadHistory();
    }

    /**
     * 设置表单元素的事件监听
     */
    setupEventListeners() {
        // 指挥官名称输入
        Helpers.getElement('fcName').addEventListener('input', e => {
            this.mainVM.operation.fcName = e.target.value;
        });

        // 地点输入
        Helpers.getElement('location').addEventListener('input', e => {
            this.mainVM.operation.location = e.target.value;
        });

        // 舰队类型选择
        Helpers.getElement('fleetType').addEventListener('change', e => {
            this.mainVM.operation.fleetType = e.target.value;
        });

        // 目标输入
        Helpers.getElement('target').addEventListener('input', e => {
            this.mainVM.operation.target = e.target.value;
        });

        // 回站地点输入
        Helpers.getElement('rtbLocation').addEventListener('input', e => {
            this.mainVM.operation.rtbLocation = e.target.value;
        });

        // 作战摘要输入
        Helpers.getElement('combatSummary').addEventListener('input', e => {
            this.mainVM.operation.combatSummary = e.target.value;
        });

        // JSON文件导入选择
        Helpers.getElement('jsonFileInput').addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) {
                this.reportView.handleImport(file);
            }
        });
    }

    /**
     * 加载历史记录
     */
    async loadHistory() {
        await this.reportView.renderHistory();
    }

    /**
     * 切换阶段
     * @param {number} n - 阶段编号
     */
    switchPhase(n) {
        this.mainVM.switchPhase(n);
    }

    /**
     * 完成当前阶段
     * @param {number} n - 阶段编号
     */
    completePhase(n) {
        this.mainVM.completeCurrentPhase();
    }

    /**
     * 切换标签选中状态
     * @param {HTMLElement} btn - 按钮元素
     * @param {string} tag - 标签名称
     */
    toggleTag(btn, tag) {
        btn.classList.toggle('active');
        const idx = this.tags.indexOf(tag);
        if (idx === -1) {
            this.tags.push(tag);
        } else {
            this.tags.splice(idx, 1);
        }
        this.mainVM.operation.tags = this.tags;
    }

    /**
     * 导入集结名单
     */
    importForming() {
        const text = this.formingView.getImportText();
        if (!text.trim()) {
            Helpers.alert('请输入集结名单', 'error');
            return;
        }
        this.mainVM.formingVM.importMembers(text);
        this.formingView.showMemberPanel();
    }

    /**
     * 手动添加成员
     */
    addManualMember() {
        const line = prompt('请输入成员信息（格式：角色名|舰船类型|备注）：', '');
        if (!line) return;
        this.mainVM.formingVM.addManualMember(line);
        this.formingView.showMemberPanel();
    }

    /**
     * 删除成员
     * @param {number} i - 成员索引
     */
    deleteMember(i) {
        if (Helpers.confirm('确定删除此成员？')) {
            this.mainVM.formingVM.deleteMember(i);
        }
    }

    /**
     * 刷新成员统计
     */
    refreshMemberStats() {
        this.mainVM.formingVM.notifyStatsChanged();
    }

    /**
     * 导入回站名单
     */
    importRTB() {
        const text = this.rtbView.getImportText();
        if (!text.trim()) {
            Helpers.alert('请输入回站名单', 'error');
            return;
        }
        this.mainVM.rtbVM.importMembers(text);
    }

    /**
     * 解析击杀邮件
     */
    parseKM() {
        const text = this.rtbView.getKMText();
        if (!text.trim()) {
            Helpers.alert('请输入KM链接', 'error');
            return;
        }
        this.mainVM.rtbVM.parseKM(text);
    }

    /**
     * 保存报告
     */
    async saveReport() {
        await this.reportView.handleSave();
    }

    /**
     * 复制报告
     */
    copyReport() {
        this.reportView.handleCopy();
    }

    /**
     * 导出历史记录为JSON
     */
    async exportHistoryJson() {
        await this.reportView.handleExport();
    }

    /**
     * 触发导入JSON文件选择
     */
    importHistoryJson() {
        Helpers.getElement('jsonFileInput').click();
    }

    /**
     * 重置页面数据
     */
    resetPageData() {
        this.mainVM.resetAll();
        this.mainView.resetUI();
        this.formingView.hideMemberPanel();
        Helpers.hideElement('lossRegisterPanel');
        Helpers.alert('数据已重置', 'success');
    }

    /**
     * 清空所有历史记录
     */
    async clearAllHistory() {
        await this.reportView.handleClearHistory();
    }
}

// 全局应用实例
let app;

// 页面加载完成后初始化应用
window.onload = function() {
    app = new App();
    app.init();
    Helpers.setElementValue('formTime', Helpers.getTime());
};
