import { useEffect, useRef } from "react";
import { createLocalDictation } from "@quiescent/editor";
import { localDictation } from "../../writing/local-dictation";

/**
 * The editor's on-device dictation, pointed at the assistant's composer
 * instead of the post body. Audio never leaves the device; only the text
 * transcript is sent when the writer presses Send.
 */
export function DictateButton({ onText, onStatus, onStart, disabled }: {
  onText: (text: string) => void;
  onStatus: (message: string) => void;
  onStart?: () => void;
  disabled?: boolean;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const interim = useRef<HTMLSpanElement>(null);
  const callbacks = useRef({ onText, onStatus, onStart });
  callbacks.current = { onText, onStatus, onStart };
  const controller = useRef<ReturnType<typeof createLocalDictation> | null>(null);

  useEffect(() => {
    if (!button.current || !interim.current) return;
    const options = localDictation((message) => callbacks.current.onStatus(message));
    const dictation = createLocalDictation({
      ...options,
      button: button.current,
      interim: interim.current,
      insert: (text) => callbacks.current.onText(text),
      onStart: () => callbacks.current.onStart?.(),
      onStatus: (message) => callbacks.current.onStatus(message),
    });
    controller.current = dictation;
    return () => {
      dictation.destroy();
      controller.current = null;
    };
  }, []);

  useEffect(() => {
    controller.current?.setEnabled(!disabled);
  }, [disabled]);

  // Quiescent's controller owns the button's label and state.
  return (
    <span className="assistant-dictate">
      <button ref={button} type="button" className="assistant-mic" />
      <span ref={interim} className="assistant-interim" aria-live="polite" />
    </span>
  );
}
