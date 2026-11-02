import {
  consumeStream,
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  type LanguageModel,
  stepCountIs,
  type StopCondition,
  streamText,
  type SystemModelMessage,
  toUIMessageStream,
  type ToolSet,
  type UIMessage,
} from "ai";
import type { Thread, ThreadStore } from "./store";

export const newMessageId = createIdGenerator({ prefix: "msg", size: 16 });

export interface ReplyOptions<TOOLS extends ToolSet> {
  store: ThreadStore;
  thread: Thread;
  /** The new user message. Earlier messages come from the store. */
  message: UIMessage;
  model: LanguageModel;
  instructions: SystemModelMessage[];
  /** Tools for this reply. `replyId` is the id the reply will be saved under. */
  tools: (context: { replyId: string }) => TOOLS;
  stopWhen?: StopCondition<TOOLS>[];
  providerOptions?: Parameters<typeof streamText>[0]["providerOptions"];
  maxOutputTokens?: number;
  history?: number;
}

/**
 * One turn: save the user's message, stream the model's reply as a UI message
 * stream, and save the reply when it ends, even if the browser disconnects.
 */
export async function streamThreadReply<TOOLS extends ToolSet>(options: ReplyOptions<TOOLS>): Promise<Response> {
  const { store, thread, message } = options;
  const history = (await store.messages(thread.id, options.history ?? 60)).filter((item) => item.id !== message.id);
  const messages = [...history, message];
  // The writer's words are kept even if the reply fails.
  await store.save(thread.id, [message]);

  const replyId = newMessageId();
  const tools = options.tools({ replyId });
  const result = streamText({
    model: options.model,
    instructions: options.instructions,
    messages: await convertToModelMessages(messages, { tools, ignoreIncompleteToolCalls: true }),
    tools,
    stopWhen: [...(options.stopWhen ?? []), stepCountIs(8)],
    maxOutputTokens: options.maxOutputTokens ?? 8000,
    abortSignal: AbortSignal.timeout(120_000),
    ...(options.providerOptions ? { providerOptions: options.providerOptions } : {}),
  });
  const stream = toUIMessageStream({
    stream: result.stream,
    tools,
    originalMessages: messages,
    generateMessageId: () => replyId,
    onError: () => "The assistant could not finish this reply. Please try again.",
    onEnd: async ({ messages: all }) => {
      const known = new Set([...history.map((item) => item.id), message.id]);
      await store.save(thread.id, all.filter((item) => !known.has(item.id)));
    },
  });
  return createUIMessageStreamResponse({
    stream,
    headers: { "Cache-Control": "private, no-store" },
    consumeSseStream: ({ stream: copy }) => { void consumeStream({ stream: copy }); },
  });
}
