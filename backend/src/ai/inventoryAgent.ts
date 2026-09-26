import {
  openRouterClient,
  ChatMessage,
} from "./client.js";
import { STOCKSENSE_SYSTEM_PROMPT } from "./prompts.js";
import { AI_TOOL_DEFINITIONS, executeAiTool } from "./tools.js";

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface InventoryAgentResponse {
  success: boolean;
  message: string;
  toolCalls?: Array<{
    tool: string;
    args?: any;
  }>;
  error?: string;
}

export class InventoryAgent {
  private maxToolIterations = 5;

  public async chat(
    userMessage: string,
    history: ChatHistoryItem[] = [],
    _userContext?: { id?: string; name?: string; role?: string }
  ): Promise<InventoryAgentResponse> {
    if (!userMessage || userMessage.trim().length === 0) {
      return {
        success: false,
        message: "Message cannot be empty.",
        error: "EMPTY_MESSAGE",
      };
    }

    if (!openRouterClient.isConfigured()) {
      return {
        success: false,
        message:
          "AI service is not configured. Set OPENROUTER_API_KEY on the backend.",
        error: "OPENROUTER_NOT_CONFIGURED",
      };
    }

    // Build bounded conversation messages
    const boundedHistory = history.slice(-8); // Keep last 8 turns max
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: STOCKSENSE_SYSTEM_PROMPT,
      },
      ...boundedHistory.map((item) => ({
        role: item.role,
        content: item.content,
      })),
      {
        role: "user",
        content: userMessage.trim(),
      },
    ];

    const executedTools: Array<{ tool: string; args?: any }> = [];
    let iterations = 0;

    try {
      while (iterations < this.maxToolIterations) {
        iterations++;

        // Request completion from OpenRouter with tools
        const assistantMessage = await openRouterClient.completeChat(
          messages,
          AI_TOOL_DEFINITIONS
        );

        // Append assistant's turn to conversation history
        messages.push(assistantMessage);

        // Check if model called one or more tools
        if (
          assistantMessage.tool_calls &&
          assistantMessage.tool_calls.length > 0
        ) {
          for (const tc of assistantMessage.tool_calls) {
            const toolName = tc.function?.name;
            const rawArgs = tc.function?.arguments;

            let parsedArgs: any = {};
            try {
              parsedArgs = rawArgs ? JSON.parse(rawArgs) : {};
            } catch {
              parsedArgs = { raw: rawArgs };
            }

            executedTools.push({ tool: toolName, args: parsedArgs });

            let toolResult: any;
            try {
              toolResult = await executeAiTool(toolName, parsedArgs);
            } catch (toolErr: any) {
              toolResult = {
                error: true,
                message: toolErr.message || "Failed to execute tool",
              };
            }

            // Append tool response message according to function calling spec
            messages.push({
              role: "tool",
              tool_call_id: tc.id,
              name: toolName,
              content: JSON.stringify(toolResult),
            });
          }

          // Continue loop to allow Nemotron to inspect tool results and form answer
          continue;
        }

        // If no tool calls were made, we have the final assistant message
        const finalAnswer =
          assistantMessage.content ||
          "I have processed your request, but no text response was generated.";

        return {
          success: true,
          message: finalAnswer,
          toolCalls: executedTools,
        };
      }

      // If loop limit reached, attempt one final call without tools to summarize
      const fallbackSummary = await openRouterClient.completeChat([
        ...messages,
        {
          role: "user",
          content:
            "Please summarize the findings from the tool executions above into a final response.",
        },
      ]);

      return {
        success: true,
        message:
          fallbackSummary.content ||
          "Completed inventory analysis based on retrieved database records.",
        toolCalls: executedTools,
      };
    } catch (err: any) {
      console.error("InventoryAgent error during chat completion:", err);
      return {
        success: false,
        message:
          err.message ||
          "An error occurred while communicating with the AI assistant.",
        toolCalls: executedTools,
        error: "AI_COMPLETION_ERROR",
      };
    }
  }
}

export const inventoryAgent = new InventoryAgent();
