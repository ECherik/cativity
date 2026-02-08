import io from "socket.io-client";
import { Cat } from "../shared/types";
import { initChat } from "./chat";

const socket = io("http://localhost:3000"); // adjust for production

const catsOnScreen: Record<string, HTMLElement> = {};
const keys: Record<string, boolean> = {};

window.addEventListener("DOMContentLoaded", () => {
  const cat = document.getElementById("cat")!;
  const catBody = document.getElementById("cat-body")!;
  const message = document.getElementById("message")!;

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

  document.body.appendChild(catDiv);
  return catDiv;
}

initChat(socket, catsOnScreen, cat);

// Initialize all cats
socket.on("init", (cats: Cat[]) => {
  cats.forEach(cat => {
    if (!catsOnScreen[cat.id]) {
      catsOnScreen[cat.id] = createCatElement(cat);
    }
  });
});

// New user joined
socket.on("catJoined", (cat: Cat) => {
  if (!catsOnScreen[cat.id]) {
    catsOnScreen[cat.id] = createCatElement(cat);
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
socket.on("catMessage", ({ id, message }: { id: string, message: string }) => {
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

// Send our movement every frame
function sendMovement(x: number, y: number, anim: 'idle' | 'walk' | 'jump') {
  socket.emit("move", { x, y, anim });
}

// Example: send movement in your existing movementLoop
function movementLoop() {
  const speed = isDragging ? 0.25 : 0.08;

  currentX += (targetX - currentX) * speed;
  currentY += (targetY - currentY) * speed;

  if(!cat) return;
  cat.style.transform = `translate(${currentX}px, ${currentY}px)`;
  const flip = targetX < currentX ? -1 : 1; 
  catBody.style.transform = `scaleX(${flip})`;

  // Send movement to server
  sendMovement(currentX, currentY, isCatMoving() ? 'walk' : 'idle');

  requestAnimationFrame(movementLoop);
}

let currentActivityIndex = 0;

function initializeActivity(messageElement: HTMLElement) {
  // React to activity changes from the main process
  if (window.electron.onActivityChanged) {
    window.electron.onActivityChanged((data: any) => {
      console.log("[Activity] Activity changed:", data);
      messageElement.textContent = data.category || data.activity || "...";
      messageElement.style.opacity = "1";
      console.log("[Activity] Displaying message:", messageElement.textContent);
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
// window.electron.setClickThrough(true);

cat.addEventListener("mouseenter", () => {
  window.electron.setClickThrough(false);
  console.log("Mouse on cat");
});

cat.addEventListener("mouseleave", () => {
  window.electron.setClickThrough(true);
  console.log("Mouse NOT on cat");
});

cat.addEventListener("click", () => {
  console.log("Cat clicked");
  message.style.opacity = "1";
  setTimeout(() => {
    message.style.opacity = "0";
  }, 2000);
});

//Dragging 
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

let currentX = (window.innerWidth - cat.offsetWidth) / 2;
let currentY = window.innerHeight - cat.offsetHeight - 8;
let targetX = currentX;
let targetY = currentY;

cat.style.position = "fixed";
cat.style.left = "0";
cat.style.top = "0";
cat.style.willChange = "transform";
cat.draggable = false;

cat.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - cat.getBoundingClientRect().left;
  offsetY = e.clientY - cat.getBoundingClientRect().top;
  window.electron.setClickThrough(false);
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const speed = 0.25;
  const mouseX = e.clientX - offsetX;
  const mouseY = e.clientY - offsetY;

  targetX += (mouseX - targetX) * speed;
  targetY += (mouseY - targetY) * speed;
});

document.addEventListener("mouseup", () => {
  if (!isDragging) return;
  isDragging = false;

  targetY = window.innerHeight - cat.offsetHeight - 8;
  targetX = currentX;

  window.electron.setClickThrough(true);
});

movementLoop();


//movement with arrow keys

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

const step = 5; // pixels per frame

function moveCat() {
  // Only move if not dragging
  if (isDragging) {
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

function isCatMoving() {
  return isDragging || keys["ArrowUp"] || keys["ArrowDown"] || keys["ArrowLeft"] || keys["ArrowRight"];
}

function animateCatState() {
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


function faceDirection(cat: HTMLElement, direction: "left" | "right") {
  if (direction === "left") {
    cat.style.transform = `translate(${currentX}px, ${currentY}px) scaleX(-1)`;
  } else {
    cat.style.transform = `translate(${currentX}px, ${currentY}px) scaleX(1)`;
  }
}

// Initialize activity display
initializeActivity(message!);



});






