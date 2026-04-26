/**
 * 辅助工具函数
 * 提供常用的DOM操作、提示框等辅助功能
 */
const Helpers = {
    /**
     * 获取当前时间字符串
     * 格式：MM-DD HH:mm
     * @returns {string} 格式化的时间字符串
     */
    getTime() {
        const d = new Date();
        const MM = String(d.getMonth() + 1).padStart(2, '0');
        const DD = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${MM}-${DD} ${hh}:${mm}`;
    },

    /**
     * 生成唯一ID
     * @param {string} prefix - 前缀
     * @returns {string} 唯一ID
     */
    generateUniqueId(prefix = '') {
        const time = Date.now().toString(36);
        const rand = Math.random().toString(36).slice(2, 6);
        return prefix ? `${prefix}-${time}${rand}` : `${time}${rand}`;
    },

    /**
     * 获取DOM元素
     * @param {string} id - 元素ID
     * @returns {HTMLElement|null} DOM元素
     */
    getElement(id) {
        return document.getElementById(id);
    },

    /**
     * 显示元素
     * @param {string} id - 元素ID
     */
    showElement(id) {
        const el = this.getElement(id);
        if (el) el.style.display = 'block';
    },

    /**
     * 隐藏元素
     * @param {string} id - 元素ID
     */
    hideElement(id) {
        const el = this.getElement(id);
        if (el) el.style.display = 'none';
    },

    /**
     * 设置元素文本内容
     * @param {string} id - 元素ID
     * @param {string} text - 文本内容
     */
    setElementText(id, text) {
        const el = this.getElement(id);
        if (el) el.innerText = text;
    },

    /**
     * 获取元素值
     * @param {string} id - 元素ID
     * @returns {string} 元素值
     */
    getElementValue(id) {
        const el = this.getElement(id);
        return el ? el.value : '';
    },

    /**
     * 设置元素值
     * @param {string} id - 元素ID
     * @param {string} value - 值
     */
    setElementValue(id, value) {
        const el = this.getElement(id);
        if (el) el.value = value;
    },

    /**
     * 显示提示框
     * @param {string} message - 提示消息
     * @param {string} type - 类型：success/error/info
     */
    alert(message, type = 'info') {
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
        window.alert(`${icon} ${message}`);
    },

    /**
     * 显示确认框
     * @param {string} message - 确认消息
     * @returns {boolean} 用户选择
     */
    confirm(message) {
        return window.confirm(message);
    },

    /**
     * 解析击杀邮件链接获取角色名
     * @param {string} line - KM链接行
     * @returns {string|null} 角色名
     */
    parseKillmailUrl(line) {
        line = line.trim();
        if (!line) return null;

        if (line.includes('zkillboard.com/character/')) {
            const parts = line.split('/character/');
            if (parts[1]) {
                return parts[1].split('/')[0];
            }
        }
        return null;
    }
};