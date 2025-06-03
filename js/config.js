// Configuration for AI Chat
const CONFIG = {
    // Gemini API Configuration
    GEMINI: {
        API_KEY: 'AIzaSyC5ZFn9OGxsZ6M5BG-8Cs-w8fvFGrU3Un4',
        API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
        MODEL: 'gemini-1.5-flash-latest',
        MAX_TOKENS: 1000,
        TEMPERATURE: 0.7
    },
    
    // Theme Configuration
    THEME: {
        PRIMARY_COLOR: '#3b82f6',
        SECONDARY_COLOR: '#1d4ed8',
        PRIMARY_RGB: '59, 130, 246',
        SECONDARY_RGB: '29, 78, 216',
        ACCENT_COLOR: '#60a5fa',
        GRADIENT_START: '#3b82f6',
        GRADIENT_END: '#1d4ed8'
    },
    
    // Chat Settings
    CHAT: {
        TYPING_DELAY_MIN: 500,
        TYPING_DELAY_MAX: 1500,
        MAX_MESSAGE_LENGTH: 500,
        AUTO_SCROLL: true,
        ANIMATION_DURATION: 300,
        INTERACTION_EFFECTS: true
    },
    
    // Animation Settings
    ANIMATIONS: {
        HOVER_SCALE: 1.05,
        BUTTON_SCALE: 1.02,
        TRANSITION_DURATION: 300,
        SPRING_TENSION: 280,
        SPRING_FRICTION: 60
    },
    
    // Error Messages
    MESSAGES: {
        API_ERROR: '抱歉，AI服务暂时不可用，正在使用本地模式为您回答。',
        NETWORK_ERROR: '网络连接异常，请检查您的网络设置。',
        RATE_LIMIT: 'API调用频率过高，请稍后再试。',
        GENERAL_ERROR: '系统出现异常，请稍后重试。',
        WELCOME: '✨ 我是基于Google Gemini AI增强的智能助手，对刘翔的专业背景非常了解。您可以问我关于他的项目经验、技能专长、教育背景等任何问题！'
    },
    
    // Contact Information
    CONTACT: {
        GITHUB: 'https://github.com/xcool2046',
        EMAIL: 'x233577@163.com',
        PHONE: '15757198473'
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
} 