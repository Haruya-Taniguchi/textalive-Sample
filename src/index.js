import P5 from "p5";
import {Player, Ease} from "textalive-app-api";

const player = new Player({
  app: {
    appAuthor: "textAlive",
    appName: "p5.js example",
  },
  mediaElement: document.querySelector("#media"),
});

let init = false;
let phraseTxt = "";

player.addListener({
  onAppReady: (app) =>{
    if (!app.songUrl) {
      player.createFromSongUrl("https://www.youtube.com/watch?v=getnInTwE7o");
    }
  },
  onTextLoad: (body) =>{
    document.querySelector("#dummy").textContent = body?.text;
  },

  onVideoReady: () => {
    //何してんの？
    if (!player.app.managed) {
      document.querySelector("#message").className = "active";
    }
    document.querySelector("#overlay").className = "inactive";
  },
  onPlay: () =>{
    //何してんの？
    document.querySelector("#message").className = "inactive";
    if (!player.app.managed) {
      document.querySelector("#control").className = "";
    }
    console.log("player.onPlay");
  },
  nPause: () => {
    console.log("player.onPause");
  },

  onSeek: () => {
    console.log("player.onSeek");
  },
  onStop: () => {
    if (!player.app.managed) {
      document.querySelector("#control").className = "active";
    }
    console.log("player.onStop");
  },
  onTimerReady: () => {
    let p = player.video.firstPhrase;
  
    // set `animate` method
    while (p && p.next) {
      p.animate = animatePhrase;
      p = p.next;
    }
  },
});

document.querySelector("#rewind").addEventListener("click",()=>{
  player.requestPlay();
});

new P5((p5) => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    p5.mousePressed = ()=>{
      player.requestPlay();
    }
    p5.setup = ()=>{
      p5.createCanvas(width, height);
      p5.frameRate(30);
      p5.background(0);
      p5.noStroke();
      p5.textFont("Noto Sans JP");
      p5.textAlign(p5.CENTER, p5.CENTER);
    }
    p5.draw = () => {
      if(!player || !player.video){
        return;
      }

      const position = player.timer.position;
      const beat = player.findBeat(position);

      p5.background(0);
      if(beat){
        const progress = beat.progress(position);
        //p5.fill(255,255,255,Ease.quintOut(progress)*128); 
        //p5.rect(0,0,width,height);
      }

      // - 再生位置より 100 [ms] 前の時点での発声文字を取得
      // - { loose: true } にすることで発声中でなければ一つ後ろの文字を取得
      let char = player.video.findChar(position - 100, {loose: true});

      if(char){
        let index = player.video.findIndex(char);
      
        while(char){
          if (char.endTime+50 <= position) {
            // これ以降の文字は表示する必要がない
            break;
          }
          // p5.textSize(200);
          if (char.startTime <= position +50) {
            p5.fill(255);
            p5.textSize(Math.min(width,height)/2);
            //p5.text(char.text,width/2,height/2);
          }
          char = char.next;
          index++;
        }
      }
      p5.fill(255);
      p5.textSize(Math.min(width,height)/16);
      p5.text(phraseTxt,width/2,height/2);
    };
});

function animatePhrase(now, unit) {
  // show current phrase
  if (unit.contains(now)) {
    phraseTxt = unit.text;
  }
};