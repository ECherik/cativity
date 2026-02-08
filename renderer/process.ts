import * as PIXI from "pixi.js";
import io from "socket.io-client";
import {CatState} from "../shared/types";

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  transparent: true,
});

document.body.appendChild(app.view);

// Connect to server
const socket = io("http://localhost:3000");

// Store cat sprites
// const cats: Record<string, PIXI.Sprite> = {};

// socket.on("state", (allCats: CatState[]) => {
//   allCats.forEach(cat => {
//     if (!cats[cat.id]) {
//       const sprite = new PIXI.Sprite(PIXI.Texture.WHITE); // placeholder, replace with cat sprite
//       sprite.width = 50;
//       sprite.height = 50;
//       sprite.x = cat.x;
//       sprite.y = cat.y;
//       app.stage.addChild(sprite);
//       cats[cat.id] = sprite;
//     } else {
//       cats[cat.id].x = cat.x;
//       cats[cat.id].y = cat.y;
//     }
//   });
// });

const cat = new PIXI.Graphics();
cat.beginFill(0xff0000);
cat.drawRect(0, 0, 50, 50);
cat.endFill();
cat.x = 100;
cat.y = 100;

app.stage.addChild(cat);
