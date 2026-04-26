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
        try {
            this.firebaseService.init();
            console.log('Firebase初始化成功');
            
            // 监听认证状态变化
            this.firebaseService.onAuthStateChanged(user => {
                this.updateAuthUI(user);
                if (user) {
                    this.loadHistory();
                } else {
                    this.loadHistory(); // 未登录时使用LocalStorage
                }
            });
        } catch (error) {
            console.error('Firebase初始化失败:', error);
            // Firebase初始化失败时，使用LocalStorage模式
            Helpers.alert('Firebase初始化失败，将使用本地存储模式', 'warning');
        }
        
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
    async updateAuthUI(user) {
        if (user) {
            // 显示用户信息
            Helpers.hideElement('loginButton');
            Helpers.hideElement('registerButton');
            Helpers.showElement('userInfo');
            
            // 获取用户名
            try {
                const userDoc = await this.firebaseService.firestore.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    Helpers.setElementValue('userEmail', userData.username);
                } else {
                    // 如果没有用户信息，显示邮箱前缀作为用户名
                    const username = user.email.split('@')[0];
                    Helpers.setElementValue('userEmail', username);
                }
            } catch (error) {
                // 出错时显示邮箱前缀
                const username = user.email.split('@')[0];
                Helpers.setElementValue('userEmail', username);
            }
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
        Helpers.setElementValue('loginUsername', '');
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
        Helpers.setElementValue('registerUsername', '');
        Helpers.setElementValue('registerPassword', '');
        Helpers.setElementValue('registerConfirmPassword', '');
        Helpers.hideElement('registerError');
    }
    
    /**
     * 用户登录
     */
    async login() {
        const username = Helpers.getElement('loginUsername').value;
        const password = Helpers.getElement('loginPassword').value;
        
        if (!username || !password) {
            Helpers.showElement('loginError');
            Helpers.setElementValue('loginError', '请填写用户名和密码');
            return;
        }
        
        try {
            await this.firebaseService.login(username, password);
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
        const username = Helpers.getElement('registerUsername').value;
        const password = Helpers.getElement('registerPassword').value;
        const confirmPassword = Helpers.getElement('registerConfirmPassword').value;
        
        if (!username || !password || !confirmPassword) {
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
            await this.firebaseService.register(username, password);
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
     * 显示军团管理模态框
     */
    showCorpManagement() {
        Helpers.showElement('corpManagementModal');
        this.loadCorpInfo();
    }
    
    /**
     * 关闭军团管理模态框
     */
    closeCorpManagementModal() {
        Helpers.hideElement('corpManagementModal');
    }
    
    /**
     * 加载军团信息
     */
    async loadCorpInfo() {
        try {
            const user = this.firebaseService.getCurrentUser();
            if (!user) {
                return;
            }
            
            const corpDoc = await this.firebaseService.firestore.collection('corps').doc(user.uid).get();
            if (corpDoc.exists) {
                const corpData = corpDoc.data();
                Helpers.setElementValue('corpName', corpData.name || '');
                Helpers.setElementValue('corpTag', corpData.tag || '');
                
                if (corpData.members) {
                    this.renderCorpMembers(corpData.members);
                } else {
                    this.renderCorpMembers([]);
                }
            } else {
                // 初始化空数据
                Helpers.setElementValue('corpName', '');
                Helpers.setElementValue('corpTag', '');
                this.renderCorpMembers([]);
            }
        } catch (error) {
            console.error('加载军团信息失败:', error);
        }
    }
    
    /**
     * 渲染军团成员列表
     * @param {Array} members - 成员数组
     */
    renderCorpMembers(members) {
        const memberList = Helpers.getElement('memberList');
        
        if (members.length === 0) {
            memberList.innerHTML = '<div style="color: #6b7688; text-align: center; padding: 20px;">暂无成员</div>';
            return;
        }
        
        memberList.innerHTML = '';
        members.forEach((member, index) => {
            const div = document.createElement('div');
            div.style.cssText = `
                display: flex; justify-content: space-between; align-items: center;
                padding: 8px; margin-bottom: 5px;
                background: #1e293b; border-radius: 4px;
            `;
            div.innerHTML = `
                <span>${member}</span>
                <button onclick="app.removeCorpMember(${index})" style="
                    background: #ef4444; color: white;
                    border: none; padding: 4px 8px; border-radius: 3px;
                    cursor: pointer; font-size: 12px;
                ">删除</button>
            `;
            memberList.appendChild(div);
        });
    }
    
    /**
     * 添加军团成员
     */
    addCorpMember() {
        const memberName = Helpers.getElement('addMemberInput').value.trim();
        if (!memberName) {
            Helpers.alert('请输入成员名称', 'error');
            return;
        }
        
        const memberList = Helpers.getElement('memberList');
        const currentMembers = [];
        
        // 获取当前成员列表
        const memberElements = memberList.querySelectorAll('div:not([style*="text-align: center"])');
        memberElements.forEach(element => {
            const name = element.querySelector('span').textContent;
            currentMembers.push(name);
        });
        
        if (currentMembers.includes(memberName)) {
            Helpers.alert('成员已存在', 'error');
            return;
        }
        
        currentMembers.push(memberName);
        this.renderCorpMembers(currentMembers);
        Helpers.setElementValue('addMemberInput', '');
    }
    
    /**
     * 删除军团成员
     * @param {number} index - 成员索引
     */
    removeCorpMember(index) {
        const memberList = Helpers.getElement('memberList');
        const currentMembers = [];
        
        // 获取当前成员列表
        const memberElements = memberList.querySelectorAll('div:not([style*="text-align: center"])');
        memberElements.forEach(element => {
            const name = element.querySelector('span').textContent;
            currentMembers.push(name);
        });
        
        currentMembers.splice(index, 1);
        this.renderCorpMembers(currentMembers);
    }
    
    /**
     * 保存军团信息
     */
    async saveCorpInfo() {
        try {
            const user = this.firebaseService.getCurrentUser();
            if (!user) {
                Helpers.alert('请先登录', 'error');
                return;
            }
            
            const corpName = Helpers.getElement('corpName').value.trim();
            const corpTag = Helpers.getElement('corpTag').value.trim();
            
            if (!corpName) {
                Helpers.alert('请输入军团名称', 'error');
                return;
            }
            
            // 获取成员列表
            const memberList = Helpers.getElement('memberList');
            const members = [];
            
            const memberElements = memberList.querySelectorAll('div:not([style*="text-align: center"])');
            memberElements.forEach(element => {
                const name = element.querySelector('span').textContent;
                members.push(name);
            });
            
            // 保存到Firebase
            await this.firebaseService.firestore.collection('corps').doc(user.uid).set({
                name: corpName,
                tag: corpTag,
                members: members,
                ownerId: user.uid,
                updatedAt: new Date().toISOString()
            });
            
            Helpers.alert('军团信息保存成功', 'success');
            this.closeCorpManagementModal();
        } catch (error) {
            console.error('保存军团信息失败:', error);
            Helpers.alert('保存失败: ' + error.message, 'error');
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