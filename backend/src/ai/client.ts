export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
  name?: string;
}

export interface OpenRouterToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export interface OpenRouterResponse {
  id?: string;
  choices: Array<{
    message: ChatMessage;
    finish_reason: string;
    index: number;
  }>;
  error?: {
    message: string;
    code?: number | string;
  };
}

export class OpenRouterClient {
  private apiKey: string | undefined;
  private model: string;
  private siteUrl: string;
  private siteName: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.model =
      process.env.OPENROUTER_MODEL ||
      "nvidia/nemotron-3-ultra-550b-a55b-20260604:free";
    this.siteUrl = process.env.OPENROUTER_SITE_URL || "http://localhost:5000";
    this.siteName = process.env.OPENROUTER_SITE_NAME || "StockSense";
    this.apiUrl = "https://openrouter.ai/api/v1/chat/completions";
  }

  public isConfigured(): boolean {
    const key = process.env.OPENROUTER_API_KEY;
    return !!(key && key.trim().length > 0);
  }

  public getModel(): string {
    return process.env.OPENROUTER_MODEL || this.model;
  }

  public async completeChat(
    messages: ChatMessage[],
    tools?: OpenRouterToolDefinition[],
    timeoutMs = 45000
  ): Promise<ChatMessage> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error(
        "AI service is not configured. Set OPENROUTER_API_KEY on the backend."
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const payload: any = {
      model: this.getModel(),
      messages,
      temperature: 0.1,
    };

    if (tools && tools.length > 0) {
      payload.tools = tools;
      payload.tool_choice = "auto";
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
          "HTTP-Referer": this.siteUrl,
          "X-Title": this.siteName,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorDetails = `HTTP ${response.status} ${response.statusText}`;
        try {
          const errJson = await response.json();
          if (errJson?.error?.message) {
            errorDetails = errJson.error.message;
          }
        } catch {
          // ignore parsing error
        }
        throw new Error(`OpenRouter API request failed: ${errorDetails}`);
      }

      const data = (await response.json()) as OpenRouterResponse;

      if (data.error) {
        throw new Error(`OpenRouter returned an error: ${data.error.message}`);
      }

      const choice = data.choices?.[0];
      if (!choice || !choice.message) {
        throw new Error("OpenRouter returned an empty or invalid response.");
      }

      return choice.message;
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new Error(
          `OpenRouter request timed out after ${timeoutMs / 1000}s. Please try again.`
        );
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const openRouterClient = new OpenRouterClient();
