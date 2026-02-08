const cat = document.getElementById("cat");
const message = document.getElementById("message");

if (!cat) {
  throw new Error("Cat element not found");
}

if (!message) {
  throw new Error("Message element not found");
} 

// Default click through enabled
window.electron.setClickThrough(true);


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


// Set initial position at bottom center
let currentX = (window.innerWidth - cat.offsetWidth) / 2;
let currentY = window.innerHeight - cat.offsetHeight - 8; // 8px margin from bottom
let targetX = currentX;
let targetY = currentY;

cat.style.position = "fixed";
cat.style.left = "0";
cat.style.top = "0";
cat.style.willChange = "transform";
cat.draggable = false;

cat.addEventListener("mousedown", (e) => {
  isDragging = true;

  const rect = cat.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  window.electron.setClickThrough(false);
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  targetX = e.clientX - offsetX;
  targetY = e.clientY - offsetY;
});

document.addEventListener("mouseup", () => {
  if (!isDragging) return;
  isDragging = false;

  const rect = cat.getBoundingClientRect();
  targetY = window.innerHeight - rect.height - 8; // bottom margin
  targetX = currentX; // drop straight down (optional)

  window.electron.setClickThrough(true);
});


function movementLoop() {
  if (!cat) return;
  // Make falling (after drag) slower than dragging
  const speed = isDragging ? 0.35 : 0.1; // 0.05 is slower fall

  currentX += (targetX - currentX) * speed;
  currentY += (targetY - currentY) * speed;

  cat.style.transform = `translate(${currentX}px, ${currentY}px)`;

  requestAnimationFrame(movementLoop);
}
movementLoop();


//movement with arrow keys
const keys: Record<string, boolean> = {};

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
  "../assets/cat_idle.png"
];
const walkDurations = [120, 80, 120, 80]; // ms for each frame
const idleFrame = "../assets/cat_idle.png";
let animFrame = 0;

function isCatMoving() {
  return isDragging || keys["ArrowUp"] || keys["ArrowDown"] || keys["ArrowLeft"] || keys["ArrowRight"];
}

function animateCatState() {
  if (!cat) return;
  if (isCatMoving()) {
    cat.style.backgroundImage = `url('${walkFrames[animFrame % walkFrames.length]}')`;
    const duration = walkDurations[animFrame % walkDurations.length];
    animFrame = (animFrame + 1) % walkFrames.length;
    setTimeout(animateCatState, duration);
  } else {
    cat.style.backgroundImage = `url('${idleFrame}')`;
    animFrame = 0;
    setTimeout(animateCatState, 120); 
  }
}

animateCatState();

