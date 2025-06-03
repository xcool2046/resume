// AI Chat functionality
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');

    // Use configuration from config.js
    const API_CONFIG = window.CONFIG ? window.CONFIG.GEMINI : {
        API_KEY: 'AIzaSyC5ZFn9OGxsZ6M5BG-8Cs-w8fvFGrU3Un4',
        API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
        MODEL: 'gemini-1.5-flash-latest',
        MAX_TOKENS: 1000,
        TEMPERATURE: 0.7
    };

    // Knowledge base content
    const KNOWLEDGE_BASE = `
我是刘翔，很高兴通过AI助手与您交流！

基本信息：
- 姓名：刘翔
- 年龄：19岁（2005年4月生）
- 现住城市：杭州
- 求职意向：运营岗位
- 联系方式：电话15757198473，邮箱x233577@163.com

教育背景：
我目前在浙江传媒学院就读网络工程专业（本科，2023.09-2027.06），虽然专业是技术方向，但我对新媒体运营有着浓厚的兴趣和实践经验。

项目经历：

1. 贵物志小程序 - 独立全栈开发者
我在闲鱼平台独立承接了这个定制化商城小程序项目，为设计专业师生打造作品展示与价值变现平台。
• 需求洞察：我与委托方深度对话，精准把握他们对作品在线展示、便捷分类管理以及顺畅交易意向沟通的核心诉求
• 高效开发：借助Cursor AI编程工具，仅用3天完成核心功能搭建并成功上线体验版
• 敏捷迭代：主动收集用户反馈，迅速响应并优化用户体验
• 项目成果：赢得委托方高度认可，为师生提供便捷的线上展示交流渠道

2. AI医学影像分析平台（Web应用）- 独立全栈开发者
这个项目挑战在于将客户"炫酷"的抽象诉求转化为兼具专业性与科技感的界面设计。
• 需求解码：与客户深度沟通，捕捉其对专业感、科技感及数据可视化效果的期望
• 极速交付：借助Cursor AI编程工具，2小时构建出第一版前端界面原型
• 迭代优化：历经三轮细致调整，V3版本赢得客户高度赞誉
• 经验收获：深刻实践了如何将模糊的客户感知转化为清晰的产品方案

职业技能：

AIGC工具应用与创新思维：
• AI编程工具：熟练使用Cursor、trae等，高效辅助开发与任务自动化
• AI生图工具：掌握即梦、可灵等，快速生成高质量视觉素材
• AI大模型应用：熟练使用Gemini、夸克、扣子空间等，辅助内容创作和信息整合
• 技术实践：有本地部署大模型经验（使用Ollama和Chatwise），对AI技术原理有较深理解

新媒体运营核心技能：
• 平台运营：熟悉微信公众号、抖音、小红书等主流平台的运营规则和用户特点
• 内容策划：具备内容策划、文案撰写及用户互动经验
• 数据分析：对运营核心指标有基本认知，能通过数据反馈进行内容优化
• 协作能力：乐于与不同团队成员有效配合

其他技能：
• 语言能力：英语六级水平
• 办公技能：熟练使用Office等常用办公软件

兴趣爱好：
我喜欢骑行、滑板、听歌，特别关注AI前沿技术发展

自我评价：
• 我对AI技术与新媒体运营的结合点充满探索热情，具备主动学习和深度钻研的极客精神
• 我追求高效与创新，习惯运用新工具解决问题，并能靠谱地完成任务
• 我有独立完成从0到1的项目实战经历，能在多任务环境下保持专注，具备较强的抗压能力
• 我对数据变化保持敏锐关注，乐于通过实践提升运营技能
• 我擅长与团队成员沟通协作，能积极配合不同伙伴，致力于共同实现目标

简历文档：
如果您想了解更详细的信息，可以下载我的完整简历PDF文件，里面包含了更具体的项目描述、技能证书等详细内容。
`;

    // Sample responses for fallback
    const sampleResponses = [
        "感谢您对我的关注！我是一位对新媒体运营和AI工具应用充满热情的19岁大学生。",
        "我在贵物志小程序和AI医学影像分析平台项目中担任独立全栈开发者，积累了宝贵的实战经验。",
        "我熟练运用各种AIGC工具，特别是Cursor、Gemini等，相信能为运营工作带来创新思路。",
        "虽然我还年轻，但我有独立完成从0到1项目的能力，对数据敏感，乐于学习新技术。",
        "如果您想了解更多详细信息，建议下载我的完整简历查看。"
    ];

    // State management
    let isAPIAvailable = false;
    let requestCount = 0;
    const MAX_REQUESTS_PER_MINUTE = 10;

    // Initialize chat
    function initializeChat() {
        scrollToBottom();
        // Test API availability
        setTimeout(checkAPIStatus, 1000);
    }

    // Scroll chat to bottom
    function scrollToBottom() {
        if (window.CONFIG?.CHAT?.AUTO_SCROLL !== false) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // Create message element
    function createMessage(content, isUser = false, isSystemMessage = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        if (isSystemMessage) {
            messageDiv.style.opacity = '0.8';
            messageDiv.style.fontSize = '0.9em';
        }

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        if (isSystemMessage) {
            avatarDiv.innerHTML = '<i class="fas fa-info-circle"></i>';
        } else {
            avatarDiv.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Parse markdown for bot messages (not user messages to avoid XSS)
        if (!isUser && !isSystemMessage && typeof marked !== 'undefined') {
            try {
                // Configure marked for security
                marked.setOptions({
                    breaks: true,
                    gfm: true,
                    sanitize: false, // We trust our AI responses
                    smartLists: true,
                    smartypants: true
                });
                contentDiv.innerHTML = marked.parse(content);
            } catch (error) {
                console.warn('Markdown parsing failed, using plain text:', error);
                contentDiv.innerHTML = `<p>${content}</p>`;
            }
        } else {
            // For user messages and system messages, use plain text with HTML escaping
            const escapedContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            contentDiv.innerHTML = `<p>${escapedContent}</p>`;
        }

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        return messageDiv;
    }

    // Add message to chat
    function addMessage(content, isUser = false, isSystemMessage = false) {
        const messageElement = createMessage(content, isUser, isSystemMessage);
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }

    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator-message';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        scrollToBottom();
        return typingDiv;
    }

    // Remove typing indicator
    function removeTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }

    // Rate limiting check
    function checkRateLimit() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // Simple rate limiting (in a real app, you'd use server-side limiting)
        if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
            return false;
        }
        
        requestCount++;
        setTimeout(() => requestCount--, 60000);
        return true;
    }

    // Call Gemini API
    async function callGeminiAPI(message) {
        if (!checkRateLimit()) {
            throw new Error('RATE_LIMIT');
        }

        try {
            const systemPrompt = `你是刘翔本人，正在接受面试官的提问。请以第一人称"我"的视角，**必须使用markdown格式**回答面试官的问题。你需要展现出专业、自信、谦逊的求职者态度，基于以下信息回答问题。

${KNOWLEDGE_BASE}

**重要：所有回答都必须使用markdown格式！**

回答要求：
1. **强制使用markdown格式**：
   - 使用二级标题 ## 来组织内容结构
   - 使用列表 - 或 1. 来展示要点
   - 使用加粗 **重要内容** 来突出关键信息
   - 使用代码块 \`技术名称\` 来标注技术栈
   - 使用引用 > 来强调重要观点
2. **面试官视角**：假设对方是面试官，语气专业、自信但谦逊
3. **求职者定位**：突出自己适合运营岗位的能力和经验
4. **结构化回答**：用markdown让回答更清晰、有条理
5. **保持简洁**：每个回答控制在250字以内
6. **主动展示**：适当展现自己的技能优势和学习能力
7. **引导深入**：对于详细信息，引导面试官查看简历PDF

**示例格式：**
## 我的项目经验
- **贵物志小程序**：独立全栈开发
- **AI医学影像平台**：前端界面设计

> 我相信这些经验能为运营工作带来技术视角的创新思路。`;

            const fullPrompt = `${systemPrompt}\n\n用户问题：${message}`;

            const response = await fetch(`${API_CONFIG.API_URL}?key=${API_CONFIG.API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: fullPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: API_CONFIG.TEMPERATURE,
                        maxOutputTokens: API_CONFIG.MAX_TOKENS
                    }
                })
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('RATE_LIMIT');
                } else if (response.status >= 500) {
                    throw new Error('SERVER_ERROR');
                } else {
                    throw new Error(`API_ERROR: ${response.status}`);
                }
            }

            const data = await response.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                isAPIAvailable = true;
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('INVALID_RESPONSE');
            }
        } catch (error) {
            isAPIAvailable = false;
            console.error('Gemini API Error:', error);
            throw error;
        }
    }

    // Fallback AI response for when API fails
    function getFallbackResponse(userMessage) {
        const message = userMessage.toLowerCase();

        if (message.includes('项目') || message.includes('经历') || message.includes('作品')) {
            return "我主要有两个重要项目经验：贵物志小程序和AI医学影像分析平台。这两个项目我都是独立全栈开发，从需求分析到最终交付，都让我积累了宝贵的实战经验。更详细的项目信息请下载我的简历PDF查看。";
        } else if (message.includes('技能') || message.includes('能力') || message.includes('专长')) {
            return "我的核心技能包括AIGC工具应用和新媒体运营。我熟练使用Cursor、即梦、Gemini等AI工具，也有本地部署大模型的经验。在运营方面，我熟悉主流平台规则，具备内容策划和数据分析能力。具体的技能详情请参考我的简历PDF。";
        } else if (message.includes('教育') || message.includes('学历') || message.includes('背景') || message.includes('学校')) {
            return "我目前在浙江传媒学院就读网络工程专业，2023年入学，预计2027年毕业。虽然学的是技术专业，但我对新媒体运营特别感兴趣！详细的教育经历请查看我的简历PDF。";
        } else if (message.includes('联系') || message.includes('合作') || message.includes('招聘') || message.includes('工作')) {
            return "我目前在寻找运营相关的实习或工作机会！您可以通过手机15757198473或邮箱x233577@163.com联系我。如果您想了解更完整的个人信息，建议下载我的简历PDF查看。";
        } else if (message.includes('ai') || message.includes('人工智能') || message.includes('机器学习')) {
            return "我对AI技术特别有热情！我有使用Ollama和Chatwise本地部署大模型的经验，也熟练运用各种AIGC工具来提升工作效率。我觉得AI与新媒体运营的结合有巨大潜力。更多AI项目详情请查看我的简历PDF。";
        } else if (message.includes('新媒体') || message.includes('运营')) {
            return "我对新媒体运营充满热情！我熟悉微信、抖音、小红书等平台，具备内容策划和数据分析能力。虽然我还年轻，但我相信我的AI技术背景能为运营工作带来创新思路。具体案例请参考我的简历PDF。";
        } else if (message.includes('简历') || message.includes('pdf') || message.includes('下载')) {
            return "您可以点击页面上的'下载简历'按钮获取我的完整简历PDF文件。里面包含了详细的项目描述、技能证书、联系方式等完整信息，比这里的介绍更全面哦！";
        } else if (message.includes('年龄') || message.includes('多大') || message.includes('几岁')) {
            return "我今年19岁，2005年4月出生，正值青春年华！虽然年轻，但我有独立完成项目的实战经验，对学习新技术和工具都很有热情。";
        } else if (message.includes('爱好') || message.includes('兴趣') || message.includes('喜欢')) {
            return "我平时喜欢骑行、滑板、听歌，还特别关注AI前沿技术发展。我觉得保持多元化的兴趣爱好能让我在工作中有更好的创意和灵感！";
        } else {
            return sampleResponses[Math.floor(Math.random() * sampleResponses.length)] + " 如需更详细信息，建议下载我的简历PDF查看。";
        }
    }

    // Get error message based on error type
    function getErrorMessage(error) {
        const errorMessages = window.CONFIG?.MESSAGES || {
            API_ERROR: '抱歉，AI服务暂时不可用，正在使用本地模式为您回答。',
            NETWORK_ERROR: '网络连接异常，请检查您的网络设置。',
            RATE_LIMIT: 'API调用频率过高，请稍后再试。',
            GENERAL_ERROR: '系统出现异常，请稍后重试。'
        };

        if (error.message.includes('RATE_LIMIT')) {
            return errorMessages.RATE_LIMIT;
        } else if (error.message.includes('NETWORK') || error.name === 'TypeError') {
            return errorMessages.NETWORK_ERROR;
        } else if (error.message.includes('API_ERROR')) {
            return errorMessages.API_ERROR;
        } else {
            return errorMessages.GENERAL_ERROR;
        }
    }

    // Handle sending message
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Check message length
        const maxLength = window.CONFIG?.CHAT?.MAX_MESSAGE_LENGTH || 500;
        if (message.length > maxLength) {
            addMessage(`消息长度超过限制（${maxLength}字符），请简化您的问题。`, false, true);
            return;
        }

        // Disable input while processing
        chatInput.disabled = true;
        sendButton.disabled = true;

        // Add user message
        addMessage(message, true);
        chatInput.value = '';

        // Show typing indicator with dynamic delay
        const typingIndicator = showTypingIndicator();
        const typingDelay = Math.random() * 1000 + 500; // 500-1500ms

        try {
            // Try to call Gemini API
            const response = await callGeminiAPI(message);
            
            // Simulate typing delay for better UX
            setTimeout(() => {
                removeTypingIndicator(typingIndicator);
                addMessage(response, false);
            }, typingDelay);

        } catch (error) {
            console.error('Error getting AI response:', error);
            
            // Remove typing indicator
            setTimeout(() => {
                removeTypingIndicator(typingIndicator);
                
                // Use fallback response
                const fallbackResponse = getFallbackResponse(message);
                addMessage(fallbackResponse, false);
                
                // Show error notice if it's a serious error
                if (!error.message.includes('RATE_LIMIT')) {
                    const errorMsg = getErrorMessage(error);
                    if (errorMsg !== fallbackResponse) {
                        setTimeout(() => {
                            addMessage(errorMsg, false, true);
                        }, 1000);
                    }
                }
                
                updateAPIStatus(false);
            }, typingDelay);
        } finally {
            // Re-enable input
            chatInput.disabled = false;
            sendButton.disabled = false;
            chatInput.focus();
        }
    }

    // Update API status indicator
    function updateAPIStatus(available) {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.chat-status span');
        
        if (available) {
            statusIndicator.style.background = '#00ff9d';
            statusText.textContent = 'AI助手在线 (Gemini)';
        } else {
            statusIndicator.style.background = '#ff9d00';
            statusText.textContent = 'AI助手在线 (本地模式)';
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);

    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize input
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Initialize chat on load
    initializeChat();

    // Add conversation starters
    const starterQuestions = [
        "介绍一下你的项目经验？",
        "你的技能专长是什么？",
        "你的教育背景如何？",
        "如何下载你的完整简历？",
        "你在AI领域有什么经验？",
        "你为什么想做新媒体运营？"
    ];

    // Add quick question buttons
    function addQuickQuestions() {
        const quickQuestionsDiv = document.createElement('div');
        quickQuestionsDiv.className = 'quick-questions';
        quickQuestionsDiv.innerHTML = '<p style="color: #00ff9d; margin-bottom: 10px; font-size: 0.9rem;">💡 快速提问：</p>';

        starterQuestions.forEach(question => {
            const button = document.createElement('button');
            button.textContent = question;
            button.className = 'quick-question-btn';
            button.style.cssText = `
                background: rgba(0, 255, 157, 0.1);
                border: 1px solid rgba(0, 255, 157, 0.3);
                color: #00ff9d;
                padding: 8px 12px;
                margin: 4px;
                border-radius: 15px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.3s ease;
            `;

            button.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(0, 255, 157, 0.2)';
                this.style.transform = 'scale(1.02)';
            });

            button.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(0, 255, 157, 0.1)';
                this.style.transform = 'scale(1)';
            });

            button.addEventListener('click', function() {
                chatInput.value = question;
                sendMessage();
                quickQuestionsDiv.style.display = 'none';
            });

            quickQuestionsDiv.appendChild(button);
        });

        // Add after the initial bot message
        setTimeout(() => {
            chatMessages.appendChild(quickQuestionsDiv);
            scrollToBottom();
        }, 2000);
    }

    // Check API status
    function checkAPIStatus() {
        // Simple ping to check if Gemini API is accessible
        fetch(`${API_CONFIG.API_URL}?key=${API_CONFIG.API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "test"
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 1
                }
            })
        }).then(response => {
            isAPIAvailable = response.ok;
            updateAPIStatus(response.ok);
        }).catch(() => {
            isAPIAvailable = false;
            updateAPIStatus(false);
        });
    }

    // Initialize quick questions
    addQuickQuestions();

    // Add welcome message
    setTimeout(() => {
        if (chatMessages.children.length === 1) { // Only the initial message
            addMessage("✨ 你好！我是刘翔，很高兴认识你！我是一名19岁的浙传学生，对新媒体运营和AI技术都很有热情。有什么想了解的都可以问我哦！", false, true);
        }
    }, 3000);
});