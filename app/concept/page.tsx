"use client";

import { PointerEvent, WheelEvent, useState } from "react";
import "./concept.css";
import "./refine.css";

const layouts=["poster","cinema","type","split"] as const;

export default function ConceptPage(){
  const [layout,setLayout]=useState(0);
  const [focus,setFocus]=useState<"image"|"type"|null>(null);
  function move(e:PointerEvent<HTMLElement>){const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty("--x",String((e.clientX-r.left)/r.width-.5));e.currentTarget.style.setProperty("--y",String((e.clientY-r.top)/r.height-.5))}
  function wheel(e:WheelEvent<HTMLElement>){if(Math.abs(e.deltaY)<12)return;setFocus(null);setLayout(v=>(v+(e.deltaY>0?1:layouts.length-1))%layouts.length)}
  function recompose(){setFocus(null);setLayout(v=>(v+1)%layouts.length)}
  return <main className={`editorial-machine mode-${layouts[layout]} ${focus?`focus-${focus}`:""}`} onPointerMove={move} onWheel={wheel}>
    <div className="machine-grain"/>
    <header><span>VITA FLOW</span><span>EDITORIAL MACHINE / {String(layout+1).padStart(2,"0")}</span><a href="/">EXIT</a></header>
    <button className="image-material hero-image" onClick={()=>setFocus(focus==='image'?null:'image')} aria-label="放大影像"><img src="/og.png" alt="Vita Flow visual material"/><span>IMAGE / 001</span></button>
    <button className="type-material" onClick={()=>setFocus(focus==='type'?null:'type')} aria-label="重组文字"><span>VITA</span><span>FLOW</span></button>
    <button className="recompose" onClick={recompose}><i/><span>重新编排</span></button>
    <footer><span>移动改变张力</span><span>滚动切换构图</span><span>点击主体接管画面</span></footer>
  </main>
}
