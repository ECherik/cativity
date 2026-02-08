import io from "socket.io-client";
import {Cat} from "../shared/types";
import {initChat} from "./chat";

const socket = io("http://localhost:3000");
// const socket = io("http://10.122.203.11:3000"); 

const catsOnScreen: Record<string, HTMLElement> = {};
const keys: Record<string, boolean> = {};

window.addEventListener("DOMContentLoaded", () => {
  const cat = document.getElementById("cat")!;
  const catBody = document.getElementById("cat-body")!;
  const message = document.getElementById("message")!;
  const catUsername = document.getElementById("cat-username")!;
  const signIn = document.getElementById("sign-in")!;
  let signedIn = false;

  cat.hidden = true;
  cat.style.display = "none";

  function createSignInElement() {
    signIn.innerHTML = `
    <div class="sign-in-container">
      <h2>Sign In</h2>
      <input type="text" id="username" placeholder="Username" />
       <div class="color-selection">
        <label>Choose your cat color:</label>
        <div class="color-options">
          <div class="color-option" data-color="orange" style="background: #ff9966;" title="Orange"></div>
          <div class="color-option" data-color="gray" style="background: #999999;" title="Gray"></div>
          <div class="color-option" data-color="black" style="background: #333333;" title="Black"></div>
          <div class="color-option" data-color="white" style="background: #ffffff; border: 2px solid #ddd;" title="White"></div>
          <div class="color-option selected" data-color="brown" style="background: #8B4513;" title="Brown"></div>
        </div>
      </div>
      <button id="sign-in-btn">Sign In</button>
    </div>
  `;
    let selectedColor = "brown"; // Default color

    // Handle color selection
    const colorOptions = document.querySelectorAll(".color-option");
    colorOptions.forEach((option) => {
      option.addEventListener("click", () => {
        // Remove selected class from all
        colorOptions.forEach((opt) => opt.classList.remove("selected"));

        // Add selected class to clicked option
        option.classList.add("selected");

        // Store selected color
        selectedColor = option.getAttribute("data-color") || "brown";
      });
    });

    const signInBtn = document.getElementById("sign-in-btn")!;
    signInBtn.addEventListener("click", () => {
      const usernameInput = document.getElementById(
        "username",
      ) as HTMLInputElement;
      const username = usernameInput.value;

      if (!username || username.trim() === "") {
        alert("Please enter a username");
        return;
      }

      // Send username AND color to server
      socket.emit("signIn", {username, color: selectedColor});
    });

    const usernameInput = document.getElementById( "username",) as HTMLInputElement;
    usernameInput?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        signInBtn.click();
      }
    });
  }
  // Apply cat color (when you receive cat data from server)
  function applyCatColor(catElement: HTMLElement, color: string) {
    const colorFilters = {
      orange: "hue-rotate(10deg) saturate(1.5) brightness(1.1)",
      gray: "grayscale(1) brightness(0.9)",
      black: "brightness(0.4) saturate(0) contrast(1.2)",
      white: "brightness(1.6) saturate(0.2) contrast(0.9)",
      brown: "none", // Default light brown - no filter needed
      darkbrown: "hue-rotate(-10deg) saturate(1.1) brightness(0.8)",
      ginger: "hue-rotate(20deg) saturate(1.6) brightness(1.05)",
      cream: "brightness(1.3) saturate(0.6) hue-rotate(5deg)",
    };

    const catBody = catElement.querySelector(".cat-body") as HTMLElement;
    if (catBody) {
      catBody.style.filter =
        colorFilters[color as keyof typeof colorFilters] || colorFilters.brown;
    }
  }
  // Create a new cat div
  function createCatElement(cat: Cat) {
    const catDiv = document.createElement("div");
    catDiv.className = "cat";
    catDiv.id = cat.id;

    const catBody = document.createElement("div");
    catBody.className = "cat-body";
    catDiv.appendChild(catBody);

    const messageDiv = document.createElement("div");
    messageDiv.className = "message";
    messageDiv.textContent = cat.message || "";
    catDiv.appendChild(messageDiv);

    const catUsername = document.createElement("div");
    catUsername.className = "cat-username";
    catUsername.textContent = cat.username;
    catDiv.appendChild(catUsername);

    document.body.appendChild(catDiv);
    // Apply color filter
    applyCatColor(catDiv, cat.color);
    return catDiv;
  }

  initChat(socket, catsOnScreen, cat);
  socket.on("connect", () => {
    console.log("Connected to server with ID:", socket.id);
    createSignInElement();

    cat.hidden = true;
    cat.style.display = "none";
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server");
    signIn.innerHTML = "";
    signedIn = false;

    // Hide cat on disconnect
    cat.hidden = true;
    cat.style.display = "none";
  });

  // Initialize all cats
  socket.on("init", (cats: Cat[]) => {
    console.log("Initializing cats:", cats);

    signIn.innerHTML = "";
    signedIn = true;

    // Show our own cat
    cat.hidden = false;
    cat.style.display = "block";

    // Set username for our cat
    catUsername.textContent =
      cats.find((c) => c.id === socket.id)?.username || "You";

    cats.forEach((c) => {
      // Don't create a duplicate for our own cat
      if (c.id === socket.id) {
        applyCatColor(cat, c.color);
        return;
      }

      if (!catsOnScreen[c.id]) {
        catsOnScreen[c.id] = createCatElement(c);
      }
    });
  });

  // New user joined
  socket.on("catJoined", (c: Cat) => {
    // Don't create a duplicate for our own cat
    if (c.id === socket.id) {
      applyCatColor(cat, c.color);
      return;
    }

    if (!catsOnScreen[c.id]) {
      catsOnScreen![c.id] = createCatElement(c);
    }
  });

  // Cat moved
  socket.on("catMoved", (cat: Cat) => {
    const catDiv = catsOnScreen[cat.id];
    if (!catDiv) return;

    catDiv.style.transform = `translate(${cat.x}px, ${cat.y}px)`;
    // Add animation logic based on cat.anim if you want

    animateCatState();
  });

  // Cat sent message
  socket.on("catMessage", ({id, message}: {id: string; message: string}) => {
    const catDiv = catsOnScreen[id];
    if (!catDiv) return;

    const msgDiv = catDiv.querySelector(".message") as HTMLElement;
    msgDiv.textContent = message;
    msgDiv.style.opacity = "1";
    setTimeout(() => (msgDiv.style.opacity = "0"), 2000);
  });

  // Cat disconnected
  socket.on("catLeft", (id: string) => {
    const catDiv = catsOnScreen[id];
    if (!catDiv) return;

    catDiv.remove();
    delete catsOnScreen[id];
  });

  function sendMovement(x: number, y: number, anim: "idle" | "walk" | "jump") {
   if (!signedIn) return;
    socket.emit("move", {x, y, anim});
  }

  function movementLoop() {
    const speed = isDragging ? 0.25 : 0.08;

    if (!cat) return;

    if (!isDragging) {
      currentX += (targetX - currentX) * speed;
      currentY += (targetY - currentY) * speed;
    } else {
      currentX = targetX;
      currentY = targetY;
    }
    
    const dx = currentX - lastX;
    const dy = currentY - lastY;
    const velocity = Math.sqrt(dx * dx + dy * dy);
    lastX = currentX;
    lastY = currentY;
    
    const flip = targetX < currentX ? -1 : 1;

  if (isDragging) {
    const stretch = Math.min(velocity * 0.04, 0.25);
    const rotate = Math.max(Math.min(dx * 0.4, 12), -12);

    catBody.style.transform = `scaleX(${flip * (1 + stretch)}) scaleY(${1 - stretch}) rotate(${rotate}deg)`;
  } else {
    catBody.style.transform = `scaleX(${flip}) scaleY(1) rotate(0deg)`;
  }

    cat.style.transform = `translate(${currentX}px, ${currentY}px)`;

    updateCatSprite();
    sendMovement(currentX, currentY, isCatMoving() ? "walk" : "idle");
    requestAnimationFrame(movementLoop);
  }

  function initializeActivity(messageElement: HTMLElement) {
    // React to activity changes from the main process
    if (window.electron.onActivityChanged) {
      window.electron.onActivityChanged((data: any) => {
        console.log("[Activity] Activity changed:", data);
        messageElement.textContent = data.category || data.activity || "...";
        messageElement.style.opacity = "1";
        console.log(
          "[Activity] Displaying message:",
          messageElement.textContent,
        );
        // Keep message visible permanently - no timeout to fade it out
      });
    }
  }

  if (!cat) {
    throw new Error("Cat element not found");
  }

  if (!message) {
    throw new Error("Message element not found");
  }

  // Default click through enabled
  if (signedIn) {
    window.electron.setClickThrough(true);
  } 

  cat.addEventListener("mouseenter", () => {
    if (signedIn) {
      window.electron.setClickThrough(false);
      console.log("Mouse on cat");
    }
  });

  cat.addEventListener("mouseleave", () => {
    if (signedIn) {
      window.electron.setClickThrough(true);
      console.log("Mouse NOT on cat");
    }
  });

  cat.addEventListener("click", () => {
    if (!signedIn) return;

    console.log("Cat clicked");
    message.style.opacity = "1";
    setTimeout(() => {
      message.style.opacity = "0";
    }, 2000);
  });

  cat.style.position = "fixed";
  cat.style.left = "0px";
  cat.style.top = "0px";
  cat.style.willChange = "transform";
  cat.draggable = false;

  //Dragging
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let currentX = (window.innerWidth - cat.offsetWidth) / 2;
  let currentY = window.innerHeight - cat.offsetHeight - 8;
  let targetX = currentX;
  let targetY = currentY;
  let lastX = currentX;
  let lastY = currentY; 

  cat.addEventListener("mousedown", (e) => {
    if (!signedIn) return;

    isDragging = true;
    offsetX = e.clientX - cat.getBoundingClientRect().left;
    offsetY = e.clientY - cat.getBoundingClientRect().top;
    window.electron.setClickThrough(false);
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging || !signedIn) return;

    const speed = 0.25;
    const mouseX = e.clientX - offsetX;
    const mouseY = e.clientY - offsetY;

    targetX += (mouseX - targetX) * speed;
    targetY += (mouseY - targetY) * speed;
  });

  document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;

    const margin = 8;
    const catHeight = cat.offsetHeight;

    targetX = currentX;
    targetY = window.innerHeight - catHeight - margin;

    if (signedIn) {
      window.electron.setClickThrough(true);
    }
  });

  movementLoop();

  //movement with arrow keys

  document.addEventListener("keydown", (e) => {
    if (!signedIn) return;
    keys[e.key] = true;
  });

  document.addEventListener("keyup", (e) => {
    if (!signedIn) return;
    keys[e.key] = false;
  });

  const step = 5; // pixels per frame

  function moveCat() {
    // Only move if not dragging and signed in
    if (isDragging || !signedIn) {
      requestAnimationFrame(moveCat);
      return;
    }
    if (!cat) return;
    const margin = 8;
    const catWidth = cat.offsetWidth;
    const catHeight = cat.offsetHeight;
    const maxX = window.innerWidth - catWidth - margin;
    const maxY = window.innerHeight - catHeight - margin;

    if (keys["ArrowUp"]) targetY = Math.max(margin, targetY - step);
    if (keys["ArrowDown"]) targetY = Math.min(maxY, targetY + step);
    if (keys["ArrowLeft"]) targetX = Math.max(margin, targetX - step);
    if (keys["ArrowRight"]) targetX = Math.min(maxX, targetX + step);

    requestAnimationFrame(moveCat);
  }
  moveCat();

  // Animation: idle vs moving with per-frame durations
  const walkFrames = [
    "../assets/cat_walk1.png",
    "../assets/cat_idle.png",
    "../assets/cat_walk2.png",
    "../assets/cat_idle.png",
  ];
  const walkDurations = [120, 80, 120, 80]; // ms for each frame
  const idleFrame = "../assets/cat_idle.png";
  let animFrame = 0;

  function updateCatSprite() {
  if (isDragging) {
    catBody.style.backgroundImage = "url('../assets/cat_drag.png')";
  } else if (isCatMoving()) {
    catBody.style.backgroundImage = `url('${walkFrames[animFrame % walkFrames.length]}')`;
  } else {
    catBody.style.backgroundImage = "url('../assets/cat_idle.png')";
  }
}
  function isCatMoving() {
    if (!signedIn) return false;

    return (isDragging || keys["ArrowUp"] || keys["ArrowDown"] || keys["ArrowLeft"] || keys["ArrowRight"]);
  }

  function animateCatState() {
    if (!signedIn) {
      setTimeout(animateCatState, 120);
      return;
    }

    if (isCatMoving()) {
      catBody.style.backgroundImage = `url('${walkFrames[animFrame % walkFrames.length]}')`;
      const duration = walkDurations[animFrame % walkDurations.length];
      animFrame = (animFrame + 1) % walkFrames.length;
      setTimeout(animateCatState, duration);
    } else {
      catBody.style.backgroundImage = `url('${idleFrame}')`;
      animFrame = 0;
      setTimeout(animateCatState, 120);
    }
  }
  animateCatState();

  // Initialize activity display
  initializeActivity(message!);
});
