// let currentActivityIndex = 0;

// function initializeActivity(messageElement: HTMLElement) {
//   // React to activity changes from the main process
//   if (window.electron.onActivityChanged) {
//     window.electron.onActivityChanged((data: any) => {
//       console.log("[Activity] Activity changed:", data);
//       messageElement.textContent = data.category || data.activity || "...";
//       messageElement.style.opacity = "1";
//       console.log("[Activity] Displaying message:", messageElement.textContent);
//       // Keep message visible permanently - no timeout to fade it out
//     });
//   }
// }

// const cat = document.getElementById("cat");
// const catBody = document.getElementById("cat-body")!;
// const message = document.getElementById("message");

// if (!cat) {
//   throw new Error("Cat element not found");
// }

// if (!message) {
//   throw new Error("Message element not found");
// }

// // Default click through enabled
// window.electron.setClickThrough(true);

// cat.addEventListener("mouseenter", () => {
//   window.electron.setClickThrough(false);
//   console.log("Mouse on cat");
// });

// cat.addEventListener("mouseleave", () => {
//   window.electron.setClickThrough(true);
//   console.log("Mouse NOT on cat");
// });

// cat.addEventListener("click", () => {
//   console.log("Cat clicked");
//   message.style.opacity = "1";
//   setTimeout(() => {
//     message.style.opacity = "0";
//   }, 2000);
// });

// //Dragging
// let isDragging = false;
// let offsetX = 0;
// let offsetY = 0;

// let currentX = (window.innerWidth - cat.offsetWidth) / 2;
// let currentY = window.innerHeight - cat.offsetHeight - 8;
// let targetX = currentX;
// let targetY = currentY;

// cat.style.position = "fixed";
// cat.style.left = "0";
// cat.style.top = "0";
// cat.style.willChange = "transform";
// cat.draggable = false;

// cat.addEventListener("mousedown", (e) => {
//   isDragging = true;
//   offsetX = e.clientX - cat.getBoundingClientRect().left;
//   offsetY = e.clientY - cat.getBoundingClientRect().top;
//   window.electron.setClickThrough(false);
// });

// document.addEventListener("mousemove", (e) => {
//   if (!isDragging) return;

//   const speed = 0.25;
//   const mouseX = e.clientX - offsetX;
//   const mouseY = e.clientY - offsetY;

//   targetX += (mouseX - targetX) * speed;
//   targetY += (mouseY - targetY) * speed;
// });

// document.addEventListener("mouseup", () => {
//   if (!isDragging) return;
//   isDragging = false;

//   targetY = window.innerHeight - cat.offsetHeight - 8;
//   targetX = currentX;

//   window.electron.setClickThrough(true);
// });

// function movementLoop() {
//   const speed = isDragging ? 0.25 : 0.08;

//   currentX += (targetX - currentX) * speed;
//   currentY += (targetY - currentY) * speed;

//   if(!cat) return;
//   cat.style.transform = `translate(${currentX}px, ${currentY}px)`;
//   const flip = targetX < currentX ? -1 : 1;
//   catBody.style.transform = `scaleX(${flip})`;
//   requestAnimationFrame(movementLoop);
// }

// movementLoop();

// //movement with arrow keys
// const keys: Record<string, boolean> = {};

// document.addEventListener("keydown", (e) => {
//   keys[e.key] = true;
// });

// document.addEventListener("keyup", (e) => {
//   keys[e.key] = false;
// });

// const step = 5; // pixels per frame

// function moveCat() {
//   // Only move if not dragging
//   if (isDragging) {
//     requestAnimationFrame(moveCat);
//     return;
//   }
//   if (!cat) return;
//   const margin = 8;
//   const catWidth = cat.offsetWidth;
//   const catHeight = cat.offsetHeight;
//   const maxX = window.innerWidth - catWidth - margin;
//   const maxY = window.innerHeight - catHeight - margin;

//   if (keys["ArrowUp"]) targetY = Math.max(margin, targetY - step);
//   if (keys["ArrowDown"]) targetY = Math.min(maxY, targetY + step);
//   if (keys["ArrowLeft"]) targetX = Math.max(margin, targetX - step);
//   if (keys["ArrowRight"]) targetX = Math.min(maxX, targetX + step);

//   requestAnimationFrame(moveCat);
// }
// moveCat();

// // Animation: idle vs moving with per-frame durations
// const walkFrames = [
//   "../assets/cat_walk1.png",
//   "../assets/cat_idle.png",
//   "../assets/cat_walk2.png",
//   "../assets/cat_idle.png",
// ];
// const walkDurations = [120, 80, 120, 80]; // ms for each frame
// const idleFrame = "../assets/cat_idle.png";
// let animFrame = 0;

// function isCatMoving() {
//   return isDragging || keys["ArrowUp"] || keys["ArrowDown"] || keys["ArrowLeft"] || keys["ArrowRight"];
// }

// function animateCatState() {
//   if (isCatMoving()) {
//     catBody.style.backgroundImage = `url('${walkFrames[animFrame % walkFrames.length]}')`;
//     const duration = walkDurations[animFrame % walkDurations.length];
//     animFrame = (animFrame + 1) % walkFrames.length;
//     setTimeout(animateCatState, duration);
//   } else {
//     catBody.style.backgroundImage = `url('${idleFrame}')`;
//     animFrame = 0;
//     setTimeout(animateCatState, 120);
//   }
// }
// animateCatState();

// function faceDirection(cat: HTMLElement, direction: "left" | "right") {
//   if (direction === "left") {
//     cat.style.transform = `translate(${currentX}px, ${currentY}px) scaleX(-1)`;
//   } else {
//     cat.style.transform = `translate(${currentX}px, ${currentY}px) scaleX(1)`;
//   }
// }

// // Initialize activity display
// initializeActivity(message!);
