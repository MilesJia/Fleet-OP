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
        this.firebaseService = new FirebaseService();          // Firebase服务
    }

    /**
     * 初始化应用
     * 设置事件监听、绑定视图、加载历史记录
     */
    async init() {
        this.mainVM.init();
        this.mainVM.bindViews(this.formingView, this.rtbView, this.reportView, this.mainView);
        this.setupEventListeners();
        
        // 初始化Firebase
        this.firebaseService.init();
        
        // 监听认证状态变化
        this.firebaseService.onAuthStateChanged(user => {
            this.updateAuthUI(user);
            if (user) {
                this.loadHistory();
            } else {
                this.loadHistory(); // 未登录时使用LocalStorage
            }
        });
        
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
        await this.reportView.renderHistory(this.firebaseService);
    }
    
    /**
     * 更新认证UI
     * @param {Object} user - Firebase用户对象
     */
    updateAuthUI(user) {
        if (user) {
            // 显示用户信息
            Helpers.hideElement('loginButton');
            Helpers.hideElement('registerButton');
            Helpers.showElement('userInfo');
            Helpers.setElementValue('userEmail', user.email);
        } else {
            // 显示登录/注册按钮
            Helpers.showElement('loginButton');
            Helpers.showElement('registerButton');
            Helpers.hideElement('userInfo');
        }
    }
    
    /**
     * 显示登录模态框
     */
    showLoginModal() {
        Helpers.showElement('loginModal');
    }
    
    /**
     * 关闭登录模态框
     */
    closeLoginModal() {
        Helpers.hideElement('loginModal');
        Helpers.setElementValue('loginEmail', '');
        Helpers.setElementValue('loginPassword', '');
        Helpers.hideElement('loginError');
    }
    
    /**
     * 显示注册模态框
     */
    showRegisterModal() {
        Helpers.showElement('registerModal');
    }
    
    /**
     * 关闭注册模态框
     */
    closeRegisterModal() {
        Helpers.hideElement('registerModal');
        Helpers.setElementValue('registerEmail', '');
        Helpers.setElementValue('registerPassword', '');
        Helpers.setElementValue('registerConfirmPassword', '');
        Helpers.hideElement('registerError');
    }
    
    /**
     * 用户登录
     */
    async login() {
        const email = Helpers.getElement('loginEmail').value;
        const password = Helpers.getElement('loginPassword').value;
        
        if (!email || !password) {
            Helpers.showElement('loginError');
            Helpers.setElementValue('loginError', '请填写邮箱和密码');
            return;
        }
        
        try {
            await this.firebaseService.login(email, password);
            this.closeLoginModal();
            Helpers.alert('登录成功！', 'success');
        } catch (error) {
            Helpers.showElement('loginError');
            Helpers.setElementValue('loginError', error.message);
        }
    }
    
    /**
     * 用户注册
     */
    async register() {
        const email = Helpers.getElement('registerEmail').value;
        const password = Helpers.getElement('registerPassword').value;
        const confirmPassword = Helpers.getElement('registerConfirmPassword').value;
        
        if (!email || !password || !confirmPassword) {
            Helpers.showElement('registerError');
            Helpers.setElementValue('registerError', '请填写所有字段');
            return;
        }
        
        if (password !== confirmPassword) {
            Helpers.showElement('registerError');
            Helpers.setElementValue('registerError', '密码不匹配');
            return;
        }
        
        try {
            await this.firebaseService.register(email, password);
            this.closeRegisterModal();
            Helpers.alert('注册成功！', 'success');
        } catch (error) {
            Helpers.showElement('registerError');
            Helpers.setElementValue('registerError', error.message);
        }
    }
    
    /**
     * 用户退出
     */
    async logout() {
        try {
            await this.firebaseService.logout();
            Helpers.alert('已退出登录', 'success');
        } catch (error) {
            Helpers.alert('退出登录失败: ' + error.message, 'error');
        }
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
            Helpers.alert(this.i18nService.t('alerts.emptyFormImport'), 'error');
            return;
        }
        this.mainVM.formingVM.importMembers(text);
        this.formingView.showMemberPanel();
    }

    /**
     * 手动添加成员
     */
    addManualMember() {
        const line = prompt(this.i18nService.t('alerts.memberFormat'), '');
        if (!line) return;
        this.mainVM.formingVM.addManualMember(line);
        this.formingView.showMemberPanel();
    }

    /**
     * 删除成员
     * @param {number} i - 成员索引
     */
    deleteMember(i) {
        if (Helpers.confirm(this.i18nService.t('alerts.confirmDeleteMember'))) {
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
            Helpers.alert(this.i18nService.t('alerts.emptyRTBImport'), 'error');
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
            Helpers.alert(this.i18nService.t('alerts.emptyKMText'), 'error');
            return;
        }
        this.mainVM.rtbVM.parseKM(text);
    }

    /**
     * 保存报告
     */
    async saveReport() {
        await this.reportView.handleSave(this.firebaseService);
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
        await this.reportView.handleExport(this.firebaseService);
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
        await this.reportView.handleClearHistory(this.firebaseService);
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