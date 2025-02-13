import { ChatSession } from "@/types";

class LocalStorageService {
    static getChatSessions() {
        const sessions = localStorage.getItem('chatSessions');
        return sessions ? JSON.parse(sessions) as ChatSession[] : [];
    }

    private static saveChatSessions(sessions: ChatSession[]) {
        localStorage.setItem('chatSessions', JSON.stringify(sessions));
    }

    static addChatSession(session: ChatSession) {
        const sessions = this.getChatSessions();
        sessions.push(session);
        this.saveChatSessions(sessions);
    }

    static getChatSessionById(id: number) {
        const sessions = this.getChatSessions();
        return sessions.find(session => session.id === id);
    }

    static addMessageToSession(id: number, message: { user: string | 'server'; message: string; time: string }) {
        const sessions = this.getChatSessions();
        const session = sessions.find(session => session.id === id);
        if (session) {
            session.messages.push(message);
            this.saveChatSessions(sessions);
        }
    }

    static createNewSession() {
        const sessions = this.getChatSessions();
        const newSession = { id: Date.now(), time: new Date().toISOString(), messages: [] };
        sessions.push(newSession);
        this.saveChatSessions(sessions);
        return newSession;
    }
}

export const localStorageService = LocalStorageService;