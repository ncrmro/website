// The Outfitter relay's request schema, copied from ai-outfitter/webapp src/lib/inference.ts
// (`inferenceInput`, which `/api/inference/v1/chat/completions` enforces).
import { z } from "zod";
export const inferenceInput = z
  .object({
    model: z.string().min(1).max(200),
    messages: z
      .array(
        z
          .object({
            role: z.enum(["system", "developer", "user", "assistant", "tool"]),
            content: z
              .union([
                z.string(),
                z.array(
                  z
                    .object({ type: z.literal("text"), text: z.string() })
                    .strict(),
                ),
                z.null(),
              ])
              .optional(),
            name: z.string().optional(),
            tool_call_id: z.string().optional(),
            tool_calls: z.array(z.record(z.string(), z.unknown())).optional(),
            reasoning_content: z.string().optional(),
            reasoning: z.string().optional(),
            reasoning_text: z.string().optional(),
          })
          .strict(),
      )
      .min(1)
      .max(500),
    stream: z.boolean().optional(),
    store: z.literal(false).optional(),
    stream_options: z
      .object({ include_usage: z.boolean().optional() })
      .strict()
      .optional(),
    max_tokens: z.number().int().min(1).max(32768).optional(),
    max_completion_tokens: z.number().int().min(1).max(32768).optional(),
    temperature: z.number().min(0).max(2).optional(),
    top_p: z.number().min(0).max(1).optional(),
    presence_penalty: z.number().min(-2).max(2).optional(),
    frequency_penalty: z.number().min(-2).max(2).optional(),
    stop: z.union([z.string(), z.array(z.string()).max(4)]).optional(),
    seed: z.number().int().optional(),
    tools: z
      .array(
        z
          .object({
            type: z.literal("function"),
            function: z
              .object({
                name: z.string(),
                description: z.string().optional(),
                parameters: z.record(z.string(), z.unknown()).optional(),
                strict: z.boolean().nullable().optional(),
              })
              .strict(),
          })
          .strict(),
      )
      .max(128)
      .optional(),
    tool_choice: z
      .union([
        z.enum(["none", "auto", "required"]),
        z
          .object({
            type: z.literal("function"),
            function: z.object({ name: z.string() }).strict(),
          })
          .strict(),
      ])
      .optional(),
    parallel_tool_calls: z.boolean().optional(),
    reasoning_effort: z
      .enum(["none", "minimal", "low", "medium", "high", "xhigh", "max"])
      .optional(),
    response_format: z.record(z.string(), z.unknown()).optional(),
    n: z.literal(1).optional(),
  })
  .strict();
