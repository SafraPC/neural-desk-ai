import { ConfigService } from "@nestjs/config";
import { AgentType } from "@prisma/client";
import { ModelService } from "../src/model/model.service";

describe("ModelService", () => {
  const createConfigService = (values: Record<string, string | undefined>) =>
    ({
      get: jest.fn((key: string, defaultValue?: string) => values[key] ?? defaultValue),
    }) as unknown as ConfigService;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns local response when API key is missing", async () => {
    const service = new ModelService(createConfigService({}));

    const result = await service.generateResponse({
      agentType: AgentType.SUPPORT,
      systemPrompt: "support",
      prompt: "prompt",
      context: [],
    });

    expect(result.modelUsed).toBe("local-rule-based");
    expect(result.fallbackUsed).toBe(false);
    expect(result.content).toContain("support request");
  });

  it("uses fallback model when primary model fails", async () => {
    const service = new ModelService(
      createConfigService({
        OPENAI_API_KEY: "test-key",
        OPENAI_BASE_URL: "https://example.com",
        MODEL_PRIMARY: "primary-model",
        MODEL_FALLBACK: "fallback-model",
      }),
    );

    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "Fallback answer",
              },
            },
          ],
        }),
      } as Response);

    const result = await service.generateResponse({
      agentType: AgentType.SALES,
      systemPrompt: "sales",
      prompt: "prompt",
      context: [],
    });

    expect(result.modelUsed).toBe("fallback-model");
    expect(result.fallbackUsed).toBe(true);
    expect(result.content).toBe("Fallback answer");
  });

  it("falls back to local response when both remote models fail", async () => {
    const service = new ModelService(
      createConfigService({
        OPENAI_API_KEY: "test-key",
        OPENAI_BASE_URL: "https://example.com",
        MODEL_PRIMARY: "primary-model",
        MODEL_FALLBACK: "fallback-model",
      }),
    );

    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

    const result = await service.generateResponse({
      agentType: AgentType.SUPPORT,
      systemPrompt: "support",
      prompt: "prompt",
      context: [],
    });

    expect(result.modelUsed).toBe("local-rule-based");
    expect(result.fallbackUsed).toBe(true);
    expect(result.content).toContain("support request");
  });
});
