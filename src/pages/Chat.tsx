import { Logo } from "@/components/Logo";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { API_URL } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { localStorageService } from "@/services/LocalStorageService";
import { websocketService } from "@/services/WebSocketService";
import { ChatSession } from "@/types";
import { IconLoader, IconUserSquareRounded } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function Chat() {
    const { loading, user, logout } = useAuth();
    const [messages, setMessages] = useState<ChatSession['messages']>([]);
    const [input, setInput] = useState("");
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
    const [open, setOpen] = useState(true);

    useEffect(() => {
        if (currentSessionId) {
            return;
        }
        const storedSessions = localStorageService.getChatSessions();
        const newSession = localStorageService.createNewSession();
        setSessions([...storedSessions, newSession]);
        setCurrentSessionId(newSession.id);
        setMessages([]);

        websocketService.connect(API_URL);
    }, [currentSessionId]);

    useEffect(() => {
        if (!currentSessionId) {
            return;
        }
        websocketService.onMessage((message) => {
            const newMessage = { user: "server", message, time: new Date().toISOString() };
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            localStorageService.addMessageToSession(currentSessionId, newMessage);
        });
    }, [currentSessionId]);

    const handleSendMessage = () => {
        if (!currentSessionId || !user) {
            return
        }
        if (input.trim()) {
            const newMessage = { user: user.username, message: input, time: new Date().toISOString() };
            websocketService.sendMessage(input);
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            if (currentSessionId !== null) {
                localStorageService.addMessageToSession(currentSessionId, newMessage);
            }
            setInput("");
        }
    };

    const handleSessionClick = (id: number) => {
        setCurrentSessionId(id);
        const session = localStorageService.getChatSessionById(id);
        setMessages(session?.messages ?? []);
    };

    const handleNewSession = () => {
        const newSession = localStorageService.createNewSession();
        setSessions((prevSessions) => [...prevSessions, newSession]);
        setCurrentSessionId(newSession.id);
        setMessages(newSession.messages);
    };

    return (
        <div
            className={cn(
                "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700",
                "h-screen"
            )}
        >
            {
                loading ? (
                    <div className="flex items-center justify-center h-12 w-full">
                        <IconLoader className="animate-spin h-6 w-6 text-primary-500" />
                    </div>
                ) : <Sidebar open={open} setOpen={setOpen}>
                    <SidebarBody className="justify-between gap-10">
                        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                            <Logo />
                            <div className="mt-8 flex flex-col gap-2">
                                <button
                                    className="p-2 cursor-pointer bg-blue-500 text-white rounded-md"
                                    onClick={handleNewSession}
                                >
                                    New Session
                                </button>
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={`p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg text-sm ${session.id === currentSessionId ? "bg-blue-200 dark:bg-neutral-700" : ""}`}
                                        onClick={() => handleSessionClick(session.id)}
                                    >
                                        Chat Session at: {new Date(session.time).toLocaleTimeString()}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <SidebarLink
                                link={{
                                    label: user?.username ?? "User",
                                    href: "#",
                                    icon: <IconUserSquareRounded className="w-7 h-7" />,
                                }}
                            />
                            <button
                                onClick={() => {
                                    websocketService.socket?.close();
                                    logout();
                                }}
                                className="px-2 py-1 w-full cursor-pointer bg-red-500 text-white rounded-md"
                            >
                                Logout
                            </button>
                        </div>
                    </SidebarBody>
                </Sidebar>
            }
            <Dashboard messages={messages} input={input} setInput={setInput} handleSendMessage={handleSendMessage} />
        </div>
    );
}

const Dashboard = ({ messages, input, setInput, handleSendMessage }: {
    messages: { user: string; message: string; time: string }[];
    input: string;
    setInput: (input: string) => void;
    handleSendMessage: () => void;
}) => {
    return (
        <div className="flex flex-1">
            <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 h-full">
                <div className="flex-1 overflow-y-auto">
                    {
                        messages.length ? (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "p-2 border-b border-neutral-200 dark:border-neutral-700",
                                        msg.user === "server" ? "text-left" : "text-right"
                                    )}
                                >
                                    <span className={msg.user === "server" ? "bg-gray-300 text-black p-2 rounded-md inline-block" : "bg-blue-500 text-white p-2 rounded-md inline-block"}>
                                        {msg.message}
                                    </span>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(msg.time).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm">
                                No messages yet
                            </div>
                        )}
                </div>
                <div className="flex items-center">
                    <input
                        type="text"
                        value={input}
                        placeholder="Type a message..."
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                handleSendMessage();
                            }
                        }}
                        className="flex-1 p-2 border border-neutral-200 dark:border-neutral-700 rounded-md"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="ml-2 p-2 cursor-pointer bg-blue-500 text-white rounded-md"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};