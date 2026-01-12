class TelegramSender {
    constructor() {
        // Ваши данные из предыдущего проекта
        this.botToken = "5911082544:AAHl2jbB1ywkkeaV-YYWeRwleHJ63CSnfWc";
        this.chatId = "-914849102";
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    }

    /**
     * Отправляет заявку в Telegram
     * @param {string} name - Имя пользователя
     * @param {string} telegram - Логин или ссылка Telegram
     * @returns {Promise<Object>} - Результат отправки
     */
    async sendApplication(name, telegram) {
        const message = `
<b>🎨 Новая заявка с Youdes!</b>

<b>👤 Имя:</b> ${this.escapeHtml(name)}
<b>📱 Telegram:</b> ${this.escapeHtml(telegram)}
<b>⏰ Время:</b> ${new Date().toLocaleString('ru-RU')}
        `.trim();

        try {
            const response = await axios.post(this.apiUrl, {
                chat_id: this.chatId,
                parse_mode: 'html',
                text: message,
                disable_web_page_preview: true
            });

            return {
                success: response.data.ok,
                data: response.data,
                message: response.data.ok ? 'Заявка отправлена!' : 'Ошибка отправки'
            };
        } catch (error) {
            console.error('Ошибка отправки в Telegram:', error);
            return {
                success: false,
                error: error.message,
                message: 'Ошибка сети'
            };
        }
    }

    /**
     * Безопасное экранирование HTML
     */
    escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Делаем класс доступным глобально
window.TelegramSender = TelegramSender;