import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Send,
  Bot,
  ChevronLeft,
  Mic,
  Camera,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import type { UserData } from '../types/user';
import { apiClient, type SymptomLog } from '../utils/api-client';
import { aiHealthService } from '../utils/ai-health-service';
import { loadTodayPlanBundle } from '../utils/daily-plan-state';

interface AIChatScreenProps {
  user: UserData | null;
  onBack: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  requiresDoctor?: boolean;
}

const starterSuggestions = [
  'Why did my plan update today?',
  'How do I improve today’s score?',
  'Suggest my next meal',
  'Check my symptoms',
];

const formatChatTime = (timestamp: Date) =>
  timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function AIChatScreen({ user, onBack }: AIChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [chatContext, setChatContext] = useState<{
    user: UserData;
    todayPlan: Awaited<ReturnType<typeof loadTodayPlanBundle>>['planRecord'];
    generatedPlan: Awaited<ReturnType<typeof loadTodayPlanBundle>>['generatedPlan'];
    recentLogs: Awaited<ReturnType<typeof loadTodayPlanBundle>>['recentLogs'];
    symptoms: SymptomLog[];
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const effectiveUser = useMemo<UserData | null>(() => {
    if (!user) return null;
    return {
      ...user,
      goals: user.goals?.length ? user.goals : ['general-wellness'],
      medicalConditions: user.medicalConditions ?? [],
    };
  }, [user]);

  const loadChatContext = useCallback(async () => {
    if (!effectiveUser) {
      setChatContext(null);
      setMessages([]);
      setIsLoadingContext(false);
      return;
    }

    setIsLoadingContext(true);
    const [bundle, symptomsResponse] = await Promise.all([
      loadTodayPlanBundle(effectiveUser, {
        healthDays: 7,
        sleepDays: 14,
        ensurePlan: true,
      }),
      effectiveUser.id
        ? apiClient.getSymptomLogs(effectiveUser.id, 5)
        : Promise.resolve({
            success: true,
            data: { symptoms: [] },
            source: 'local' as const,
          }),
    ]);

    const nextContext = {
      user: bundle.effectiveUser,
      todayPlan: bundle.planRecord,
      generatedPlan: bundle.generatedPlan,
      recentLogs: bundle.recentLogs,
      symptoms: symptomsResponse.data?.symptoms ?? [],
    };

    setChatContext(nextContext);
    const welcome = aiHealthService.generateWelcomeReply(nextContext);
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        type: 'ai',
        content: welcome.content,
        timestamp: new Date(),
        suggestions: welcome.suggestions,
        requiresDoctor: welcome.requiresDoctor,
      },
    ]);
    setIsLoadingContext(false);
  }, [effectiveUser]);

  useEffect(() => {
    void loadChatContext();
  }, [loadChatContext]);

  useEffect(() => {
    if (!effectiveUser?.id) return;
    return apiClient.subscribeToUserHealthData(effectiveUser.id, () => {
      void loadChatContext();
    });
  }, [effectiveUser?.id, loadChatContext]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !chatContext) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    let reply = null;

    if (chatContext.user.id) {
      const response = await apiClient.sendAIChat(
        chatContext.user.id,
        userMessage.content,
      );

      if (response.success && response.data?.reply) {
        reply = response.data.reply;
      }
    }

    if (!reply) {
      reply = await aiHealthService.chatWithLiveContext(
        userMessage.content,
        chatContext,
      );
    }

    const aiMessage: Message = {
      id: `ai_${Date.now()}`,
      type: 'ai',
      content: reply.content,
      timestamp: new Date(),
      suggestions: reply.suggestions,
      requiresDoctor: reply.requiresDoctor,
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      void sendMessage();
    }
  };

  const planBadgeLabel = chatContext?.todayPlan
    ? 'Saved plan context'
    : chatContext?.generatedPlan
      ? 'Live plan preview'
      : 'Waiting for plan';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-wellness-green text-white">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white hover:bg-opacity-20">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white bg-opacity-20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-medium">AI Health Assistant</h2>
            <p className="text-xs opacity-90">Answers from your saved Aarogya data</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={() => void loadChatContext()}
          className="text-white hover:bg-white hover:bg-opacity-20"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingContext ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="px-4 py-3 border-b border-gray-100 bg-emerald-50">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            {planBadgeLabel}
          </Badge>
          {chatContext?.todayPlan?.updateReason ? (
            <span className="text-xs text-wellness-light">
              Last update: {chatContext.todayPlan.updateReason}
            </span>
          ) : (
            <span className="text-xs text-wellness-light">
              Ask about sleep, food, progress, symptoms, or today's plan.
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingContext ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-wellness-light">
            Loading your saved profile, plan, and health logs...
          </div>
        ) : null}

        {!isLoadingContext && !messages.length ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-wellness-light">
            Sign in and save your plan data to unlock contextual AI coaching.
          </div>
        ) : null}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.type === 'user'
                  ? 'wellness-green text-white'
                  : 'bg-gray-100 text-wellness-dark'
              }`}
            >
              {message.type === 'ai' ? (
                <div className="flex items-center space-x-2 mb-2">
                  <Bot className="w-4 h-4 text-wellness-green" />
                  <span className="text-xs text-wellness-green font-medium">Aarogya Coach</span>
                </div>
              ) : null}

              <p className="text-sm whitespace-pre-line">{message.content}</p>

              {message.requiresDoctor ? (
                <div className="mt-3 p-2 bg-orange-100 rounded-lg">
                  <p className="text-xs text-orange-700">
                    This may need medical attention. Please consult a doctor for urgent or worsening symptoms.
                  </p>
                </div>
              ) : null}

              {message.suggestions?.length ? (
                <div className="mt-3 space-y-2">
                  <p className="text-xs opacity-75">Quick actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={`${message.id}_${index}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-2 py-1 text-xs bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <p className="text-xs opacity-50 mt-2">{formatChatTime(message.timestamp)}</p>
            </div>
          </div>
        ))}

        {isTyping ? (
          <div className="flex justify-start">
            <div className="max-w-xs bg-gray-100 px-4 py-3 rounded-2xl">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-wellness-green" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-wellness-green rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-wellness-green rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-wellness-green rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {!messages.length && !isLoadingContext ? (
          <div className="grid grid-cols-1 gap-2">
            {starterSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="outline"
                onClick={() => handleSuggestionClick(suggestion)}
                className="justify-start"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Camera className="w-4 h-4 text-wellness-green" />
          </Button>
          <Button variant="ghost" size="sm">
            <Mic className="w-4 h-4 text-wellness-green" />
          </Button>
          <Input
            placeholder="Ask about your plan, food, sleep, or symptoms..."
            value={inputMessage}
            onChange={(event) => setInputMessage(event.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1"
            disabled={isLoadingContext || !chatContext}
          />
          <Button
            onClick={() => void sendMessage()}
            disabled={!inputMessage.trim() || isLoadingContext || !chatContext}
            className="wellness-green text-white"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-center mt-2">
          <Badge variant="secondary" className="text-xs">
            <FileText className="w-3 h-3 mr-1" />
            Uses your saved Aarogya data for guidance. See a doctor for serious issues.
          </Badge>
        </div>
      </div>
    </div>
  );
}
