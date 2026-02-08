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

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

cat.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - cat.getBoundingClientRect().left;
  offsetY = e.clientY - cat.getBoundingClientRect().top;
  window.electron.setClickThrough(false); // so mouse works while dragging
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  cat.style.position = "absolute";
  cat.style.left = `${e.clientX - offsetX}px`;
  cat.style.top = `${e.clientY - offsetY}px`;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  window.electron.setClickThrough(true);
});


const keys: Record<string, boolean> = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

const step = 5; // pixels per frame

function moveCat() {
  const cat = document.getElementById("cat");
  if (!cat) return;
  const rect = cat.getBoundingClientRect();
  cat.style.position = "absolute";
  const containerWidth = window.innerWidth;
  const containerHeight = window.innerHeight;

if (keys["ArrowUp"]) cat.style.top = `${Math.max(0, rect.top - step)}px`;
if (keys["ArrowDown"]) cat.style.top = `${Math.min(containerHeight - rect.height, rect.top + step)}px`;
if (keys["ArrowLeft"]) cat.style.left = `${Math.max(0, rect.left - step)}px`;
if (keys["ArrowRight"]) cat.style.left = `${Math.min(containerWidth - rect.width, rect.left + step)}px`;

  requestAnimationFrame(moveCat);
}

moveCat();


// Animation code
const cats = document.querySelectorAll(".cat");

const catFrames = [
  "../assets/cat_walk1.png",
  "../assets/cat_idle.png",
  "../assets/cat_walk2.png",
  "../assets/cat_idle.png"
];


const durations = [120, 80, 120, 80]; // in milliseconds

cats.forEach((c, index) => {
  if (c instanceof HTMLElement) {
    setTimeout(() => animateCat(c), index * 200);
  }
});

function animateCat(cat: HTMLElement) {
    let i = 0;
    function step() {
        cat.style.backgroundImage = `url('${catFrames[i]}')`;

        setTimeout(() => {
        i = (i + 1) % catFrames.length;
        step();
        }, durations[i]);
    }

  step();
}

