import { useEffect } from "react";

export interface CopilotEventDetail {
  query: string;
}

export function triggerCopilot(query: string = "") {
  const event = new CustomEvent<CopilotEventDetail>("open-copilot", {
    detail: { query },
  });
  window.dispatchEvent(event);
}

export function useCopilot(onOpen?: (query: string) => void) {
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<CopilotEventDetail>;
      if (onOpen) {
        onOpen(customEvent.detail.query);
      }
    };

    window.addEventListener("open-copilot", handleOpen);
    return () => {
      window.removeEventListener("open-copilot", handleOpen);
    };
  }, [onOpen]);
}
