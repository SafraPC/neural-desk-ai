import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AgentType } from "@prisma/client";
import { GenerateModelInput, ModelExecutionResult } from "./model.types";

interface OpenAiResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

@Injectable()
export class ModelService {
  private readonly logger = new Logger(ModelService.name);

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  async generateResponse(input: GenerateModelInput): Promise<ModelExecutionResult> {
    const startedAt = Date.now();
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");

    if (!apiKey) {
      return {
        content: this.buildLocalResponse(input),
        modelUsed: "local-rule-based",
        fallbackUsed: false,
        responseTimeMs: Date.now() - startedAt,
      };
    }

    const primaryModel = this.configService.get<string>("MODEL_PRIMARY", "gpt-4o-mini");
    const fallbackModel = this.configService.get<string>("MODEL_FALLBACK", "gpt-4.1-mini");

    try {
      const content = await this.callRemoteModel(primaryModel, apiKey, input);

      if (!this.isValidContent(content)) {
        throw new Error("Primary model returned empty content");
      }

      return {
        content,
        modelUsed: primaryModel,
        fallbackUsed: false,
        responseTimeMs: Date.now() - startedAt,
      };
    } catch (error) {
      this.logger.warn(
        `Primary model failed: model=${primaryModel} reason=${this.getErrorMessage(error)}`,
      );

      try {
        const content = await this.callRemoteModel(fallbackModel, apiKey, input);

        if (!this.isValidContent(content)) {
          throw new Error("Fallback model returned empty content");
        }

        return {
          content,
          modelUsed: fallbackModel,
          fallbackUsed: true,
          responseTimeMs: Date.now() - startedAt,
        };
      } catch (fallbackError) {
        this.logger.error(
          `Fallback model failed: model=${fallbackModel} reason=${this.getErrorMessage(
            fallbackError,
          )}`,
        );

        return {
          content: this.buildLocalResponse(input),
          modelUsed: "local-rule-based",
          fallbackUsed: true,
          responseTimeMs: Date.now() - startedAt,
        };
      }
    }
  }

  private async callRemoteModel(model: string, apiKey: string, input: GenerateModelInput): Promise<string> {
    const baseUrl = this.configService.get<string>("OPENAI_BASE_URL", "https://api.openai.com/v1");
    const timeoutMs = Number(this.configService.get<string>("MODEL_TIMEOUT_MS", "15000"));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: input.systemPrompt,
          },
          {
            role: "user",
            content: input.prompt,
          },
        ],
      }),
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeout);
    });

    if (!response.ok) {
      throw new Error(`Model call failed with status ${response.status}`);
    }

    const payload = (await response.json()) as OpenAiResponse;
    return payload.choices?.[0]?.message?.content?.trim() ?? "";
  }

  private isValidContent(content: string): boolean {
    return content.trim().length > 0;
  }

  private buildLocalResponse(input: GenerateModelInput): string {
    const topContext = input.context[0]?.content;

    if (input.agentType === AgentType.SALES) {
      return [
        "I can help with your sales request.",
        topContext ?? "The best next step is to confirm your plan, timeline, and main business goal.",
        "If you share your target use case, I can suggest the best plan and next step.",
      ].join(" ");
    }

    return [
      "I can help with your support request.",
      topContext ?? "Please share the exact failing step, the error message, and when the issue started.",
      "If you give me those details, I can guide the next troubleshooting step.",
    ].join(" ");
  }

  private getErrorMessage(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }

    return "unknown";
  }
}
