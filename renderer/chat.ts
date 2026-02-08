import io from "socket.io-client";

let rafStarted = false;

export function initChat(
  socket: ReturnType<typeof io>,
  catsOnScreen: Record<string, HTMLElement>,
  localCat: HTMLElement
) {
  let chatInput: HTMLInputElement | null = null;

  // One bubble container per cat
  const bubbleContainers = new Map<HTMLElement, HTMLDivElement>();

  /* =============================
     CHAT ICON (ALWAYS CLICKABLE)
  ============================== */
  const chatIcon = document.getElementById("chat-icon");
  if (!chatIcon) return;

  Object.assign(chatIcon.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "48px",
    height: "48px",
    cursor: "pointer",
    zIndex: "100005",
    pointerEvents: "auto",
  });

  // IMPORTANT: enable mouse input ONLY when hovering icon
  chatIcon.addEventListener("mouseenter", () => {
    window.electron.setClickThrough(false);
  });

  chatIcon.addEventListener("mouseleave", () => {
    if (!chatInput) {
      window.electron.setClickThrough(true);
    }
  });

  chatIcon.addEventListener("click", () => {
    chatInput ? closeChatInput() : showChatInput();
  });

  /* =============================
     CHAT INPUT
  ============================== */
  function showChatInput() {
    if (chatInput) return;

    window.electron.setClickThrough(false);

    chatInput = document.createElement("input");
    chatInput.placeholder = "Say something…";

    Object.assign(chatInput.style, {
      position: "fixed",
      zIndex: "100004",
      width: "180px",
      padding: "6px 10px",
      borderRadius: "12px",
      border: "1px solid #ccc",
      outline: "none",
      fontSize: "14px",
      pointerEvents: "auto",
    });

    document.body.appendChild(chatInput);
    chatInput.focus();

    chatInput.onkeydown = (e) => {
      if (e.key === "Enter") {
        const text = chatInput!.value.trim();
        if (text) {
          socket.emit("chatMessage", text);
          showMessageBubble(text, localCat);
        }
        closeChatInput();
      }

      if (e.key === "Escape") closeChatInput();
    };
  }

  function closeChatInput() {
    chatInput?.remove();
    chatInput = null;
    window.electron.setClickThrough(true);
  }

  function positionInput() {
    if (!chatInput) return;
    const r = localCat.getBoundingClientRect();
    chatInput.style.left = `${r.left + r.width / 2}px`;
    chatInput.style.top = `${r.top - 42}px`;
    chatInput.style.transform = "translateX(-50%)";
  }

  /* =============================
     BUBBLES
  ============================== */
  function getBubbleContainer(cat: HTMLElement) {
    let container = bubbleContainers.get(cat);
    if (container) return container;

    container = document.createElement("div");

    Object.assign(container.style, {
      position: "fixed",
      display: "flex",
      flexDirection: "column", // oldest top → newest bottom
      gap: "4px",
      alignItems: "center",
      pointerEvents: "none",
      zIndex: "100003",
    });

    document.body.appendChild(container);
    bubbleContainers.set(cat, container);
    return container;
  }

  function showMessageBubble(text: string, cat: HTMLElement) {
    const container = getBubbleContainer(cat);

    const bubble = document.createElement("div");
    bubble.textContent = limitWords(text, 30);

    Object.assign(bubble.style, {
      background: "rgba(255,255,255,0.96)",
      padding: "6px 10px",
      borderRadius: "14px",
      border: "1px solid #ccc",
      fontSize: "13px",
      maxWidth: "220px",
      wordWrap: "break-word",
      textAlign: "center",
      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
    });

    container.appendChild(bubble);

    setTimeout(() => {
      bubble.remove();
      if (!container.children.length) {
        container.remove();
        bubbleContainers.delete(cat);
      }
    }, 7000);
  }

  function limitWords(text: string, max: number) {
    const words = text.split(/\s+/);
    return words.length > max
      ? words.slice(0, max).join(" ") + "…"
      : text;
  }

  /* =============================
     FOLLOW LOOP (SINGLE RAF)
  ============================== */
  function updatePositions() {
    positionInput();

    for (const [cat, container] of bubbleContainers) {
      const r = cat.getBoundingClientRect();
      container.style.left = `${r.left + r.width / 2}px`;
      container.style.top = `${r.top - container.offsetHeight - 10}px`;
      container.style.transform = "translateX(-50%)";
    }

    requestAnimationFrame(updatePositions);
  }

  if (!rafStarted) {
    rafStarted = true;
    updatePositions();
  }

  /* =============================
     NETWORK
  ============================== */
  socket.on("chatMessage", ({ id, message }: { id: string; message: string }) => {
    const cat = catsOnScreen[id];
    if (cat) showMessageBubble(message, cat);
  });
}
