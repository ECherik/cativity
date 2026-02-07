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
