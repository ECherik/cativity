const cat = document.getElementById("cat") as HTMLImageElement;

if (!cat) {
  throw new Error("Cat element not found");
}

let lastOverCat = false;

setInterval(async () => {
  try {
    const mouse = await window.electron.getMousePos();
    const rect = cat.getBoundingClientRect();

    const overCat = mouse.x >= rect.left &&
                    mouse.x <= rect.right &&
                    mouse.y >= rect.top &&
                    mouse.y <= rect.bottom;

    if (overCat !== lastOverCat) {
      window.electron.setClickThrough(!overCat);
      lastOverCat = overCat;
    }
  } catch (err) {
    console.error(err);
  }
}, 16);


function isOver(rect: DOMRect, x: number, y: number) {
  return x >= rect.left &&
         x <= rect.right &&
         y >= rect.top &&
         y <= rect.bottom;
}

const message = document.getElementById("message") as HTMLDivElement;

cat.addEventListener("click", () => {
  message.style.opacity = "1";

  setTimeout(() => {
    message.style.opacity = "0";
  }, 100000000000);
});