// 跳转配置 - 加密或混淆后的配置
const REDIRECT_CONFIG = {
    flight: {
        url: "https://kiwi.tpk.mx/c3p3hsnR",
        keywords: ["kiwi", "flight", "airline", "airplane", "plane", "ticket", "booking", "fly"]
    },
    esim: {
        url: "https://airalo.tpk.mx/b2ZZYngy",
        keywords: ["airalo", "esim", "data", "internet", "mobile", "roaming", "sim"]
    },
    attraction: {
        url: "https://tiqets.tpk.mx/tVeWxjnH", 
        keywords: ["tiqets", "attraction", "museum", "park", "zoo", "tickets", "tours"]
    }
};

// 授权域名列表
const AUTHORIZED_DOMAINS = [
    'globaltraveldeals.pages.dev',
    'localhost', // 用于测试
    '127.0.0.1'  // 用于本地开发
];

// 立即执行跳转检测 - 不等待页面完全加载
(function() {
    'use strict';
    
    // 在脚本执行时立即检查跳转条件
    checkImmediateRedirect();
})();

/**
 * 立即检查跳转条件 - 页面加载过程中执行
 */
function checkImmediateRedirect() {
    // 获取当前页面的referrer（来源页面）
    const referrer = document.referrer;
    
    // 获取URL参数
    const params = new URLSearchParams(window.location.search);
    const keyword = (params.get('keyword') || '').toLowerCase().trim();
    
    // 如果没有keyword参数，不执行跳转
    if (!keyword) {
        console.log('No keyword parameter found - normal page load will continue');
        return;
    }
    
    // 验证来源域名
    if (!isAuthorizedSource(referrer)) {
        console.log('Unauthorized source domain - normal page load will continue');
        return;
    }
    
    // 验证来源URL格式
    if (!validateSourceUrl(referrer, keyword)) {
        console.log('Invalid source URL format - normal page load will continue');
        return;
    }
    
    // 所有验证通过，立即执行跳转
    console.log('Validation passed - executing immediate redirect');
    executeImmediateRedirect(keyword);
}

// 为了保持兼容性，保留原函数但指向新的立即跳转逻辑
function checkAuthorizedRedirect() {
    checkImmediateRedirect();
}

// 页面完全加载后的备用检查（以防立即跳转失败）
document.addEventListener("DOMContentLoaded", function() {
    // 检查是否还在原页面（说明立即跳转可能失败了）
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get('keyword');
    
    if (keyword && document.readyState === 'complete') {
        console.log('Fallback: executing redirect after DOM loaded');
        checkImmediateRedirect();
    }
});

/**
 * 验证来源是否为授权域名
 */
function isAuthorizedSource(referrer) {
    if (!referrer) {
        console.log('No referrer found');
        return false;
    }
    
    try {
        const referrerUrl = new URL(referrer);
        const domain = referrerUrl.hostname;
        
        // 检查是否在授权域名列表中
        return AUTHORIZED_DOMAINS.some(authorizedDomain => 
            domain === authorizedDomain || domain.endsWith('.' + authorizedDomain)
        );
    } catch (error) {
        console.error('Error parsing referrer URL:', error);
        return false;
    }
}

/**
 * 验证来源URL格式是否正确
 */
function validateSourceUrl(referrer, keyword) {
    try {
        const referrerUrl = new URL(referrer);
        
        // 检查路径是否包含 affiliate.html
        if (!referrerUrl.pathname.includes('affiliate.html')) {
            return false;
        }
        
        // 检查是否有keyword参数
        const referrerParams = new URLSearchParams(referrerUrl.search);
        const referrerKeyword = referrerParams.get('keyword');
        
        // 验证keyword参数存在且匹配
        return referrerKeyword && referrerKeyword.toLowerCase() === keyword;
        
    } catch (error) {
        console.error('Error validating source URL:', error);
        return false;
    }
}

/**
 * 执行立即跳转逻辑 - 不修改目标URL
 */
function executeImmediateRedirect(keyword) {
    let targetUrl = null;
    let serviceKey = null;
    
    // 根据关键词匹配对应的URL
    for (const [key, serviceConfig] of Object.entries(REDIRECT_CONFIG)) {
        if (serviceConfig.keywords.some(k => keyword.includes(k))) {
            targetUrl = serviceConfig.url;
            serviceKey = key;
            console.log(`Keyword "${keyword}" matched service: ${key}`);
            break;
        }
    }
    
    // 如果没有匹配到，随机选择一个
    if (!targetUrl) {
        const services = Object.entries(REDIRECT_CONFIG);
        const randomService = services[Math.floor(Math.random() * services.length)];
        targetUrl = randomService[1].url;
        serviceKey = randomService[0];
        console.log(`No keyword match, using random service: ${serviceKey}`);
    }
    
    if (targetUrl) {
        console.log(`Executing immediate redirect to: ${targetUrl}`);
        
        // 记录跳转信息（可选 - 用于内部统计）
        recordRedirectInfo(keyword, serviceKey, targetUrl);
        
        // 直接跳转到原始URL，不添加任何参数
        performImmediateRedirect(targetUrl);
    }
}

/**
 * 记录跳转信息（内部统计用，不影响目标URL）
 */
function recordRedirectInfo(keyword, serviceKey, targetUrl) {
    try {
        // 可以发送到你的统计服务器（可选）
        const redirectData = {
            keyword: keyword,
            service: serviceKey,
            targetUrl: targetUrl,
            source: window.location.hostname,
            referrer: document.referrer,
            timestamp: Date.now(),
            userAgent: navigator.userAgent.substring(0, 100) // 截取前100字符
        };
        
        console.log('Redirect info:', redirectData);
        
        // 如果需要统计，可以发送到你的服务器
        // sendToAnalytics(redirectData);
        
    } catch (error) {
        console.error('Error recording redirect info:', error);
    }
}

/**
 * 发送统计数据到分析服务器（可选实现）
 */
function sendToAnalytics(data) {
    // 使用navigator.sendBeacon确保数据发送不被跳转中断
    if (navigator.sendBeacon) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        navigator.sendBeacon('/analytics', formData);
    }
}

/**
 * 执行立即重定向 - 页面加载过程中跳转
 */
function performImmediateRedirect(url) {
    console.log(`Starting immediate redirect to: ${url}`);
    
    // 阻止页面继续加载
    try {
        if (document.readyState === 'loading') {
            window.stop(); // 停止页面加载
        }
    } catch (e) {
        // 某些浏览器可能不支持window.stop()
        console.log('Could not stop page loading');
    }
    
    // 立即跳转，使用最快的方法
    try {
        // 方法1: location.replace - 最快且不留历史记录
        window.location.replace(url);
    } catch (error1) {
        try {
            // 方法2: location.href - 备选方案
            window.location.href = url;
        } catch (error2) {
            try {
                // 方法3: location.assign - 第二备选
                window.location.assign(url);
            } catch (error3) {
                // 方法4: 直接设置location
                window.location = url;
            }
        }
    }
}

/**
 * 策略1: 尝试location.replace (推荐 - 无痕跳转)
 */
function attemptLocationReplace(url) {
    try {
        window.location.replace(url);
        return true;
    } catch (error) {
        console.error('location.replace failed:', error);
        return false;
    }
}

/**
 * 策略2: 尝试location.href
 */
function attemptLocationHref(url) {
    try {
        window.location.href = url;
        return true;
    } catch (error) {
        console.error('location.href failed:', error);
        return false;
    }
}

/**
 * 策略3: 尝试location.assign
 */
function attemptLocationAssign(url) {
    try {
        window.location.assign(url);
        return true;
    } catch (error) {
        console.error('location.assign failed:', error);
        return false;
    }
}

/**
 * 策略4: 创建隐藏链接并点击 (当前页面)
 */
function attemptLinkClick(url) {
    try {
        const link = document.createElement('a');
        link.href = url;
        // 不设置target，确保在当前页面打开
        link.style.display = 'none';
        link.style.visibility = 'hidden';
        link.style.position = 'absolute';
        link.style.left = '-9999px';
        
        document.body.appendChild(link);
        
        // 模拟真实的用户点击
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        
        link.dispatchEvent(event);
        
        // 清理DOM
        setTimeout(() => {
            if (document.body.contains(link)) {
                document.body.removeChild(link);
            }
        }, 100);
        
        return true;
    } catch (error) {
        console.error('Link click failed:', error);
        return false;
    }
}

/**
 * 策略5: 表单提交跳转 (当前页面)
 */
function attemptFormSubmit(url) {
    try {
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = url;
        // 不设置target，确保在当前页面打开
        form.style.display = 'none';
        form.style.visibility = 'hidden';
        form.style.position = 'absolute';
        form.style.left = '-9999px';
        
        document.body.appendChild(form);
        form.submit();
        
        // 清理DOM
        setTimeout(() => {
            if (document.body.contains(form)) {
                document.body.removeChild(form);
            }
        }, 100);
        
        return true;
    } catch (error) {
        console.error('Form submit failed:', error);
        return false;
    }
}

/**
 * 处理"查看所有优惠"按钮点击 - 直接跳转不带参数
 */
function handleDealsClick() {
    // 检查是否应该执行跳转
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get('keyword');
    
    // 如果有keyword参数，说明应该已经自动跳转了，忽略按钮点击
    if (keyword) {
        console.log('Auto-redirect mode active, ignoring button click');
        return;
    }
    
    // 只有授权来源才能触发跳转
    const referrer = document.referrer;
    if (!isAuthorizedSource(referrer)) {
        console.log('Unauthorized access to deals');
        return;
    }
    
    // 随机选择服务
    const services = Object.entries(REDIRECT_CONFIG);
    const randomService = services[Math.floor(Math.random() * services.length)];
    const targetUrl = randomService[1].url;
    const serviceKey = randomService[0];
    
    // 记录跳转信息
    recordRedirectInfo('manual', serviceKey, targetUrl);
    
    // 直接跳转到原始URL
    performImmediateRedirect(targetUrl);
}

/**
 * 显示加载动画 - 已移除，无感跳转
 */
function showLoading() {
    // 移除加载动画，实现无感跳转
}

/**
 * 隐藏加载动画 - 已移除，无感跳转  
 */
function hideLoading() {
    // 移除加载动画，实现无感跳转
}

// 防止在控制台直接调用关键函数
(function() {
    'use strict';
    
    // 混淆函数名
    const originalLog = console.log;
    console.log = function() {
        // 可以在这里添加日志过滤逻辑
        originalLog.apply(console, arguments);
    };
    
    // 监听开发者工具打开
    let devtools = {open: false};
    const element = document.createElement('div');
    Object.defineProperty(element, 'id', {
        get: function() {
            devtools.open = true;
            console.clear();
            console.log('%cWarning!', 'color: red; font-size: 30px; font-weight: bold;');
            console.log('%cThis browser feature is intended for developers. Unauthorized access may violate terms of service.', 'color: red; font-size: 14px;');
        }
    });
    
    setInterval(function() {
        devtools.open = false;
        console.dir(element);
        if (!devtools.open) {
            // 开发者工具已关闭
        }
    }, 1000);
})();