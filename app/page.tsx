"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Tab = "today" | "recipes" | "fridge" | "health" | "todos";
type Item = { id: number; name: string; detail: string; meta: string; kind: string; done?: boolean; position?: number };

const recipes = [
  { name: "中式西兰花炒鸡肉", time: "30 分钟", protein: "鸡肉", veg: "西兰花", kcal: "约 380 kcal", tags: ["中式", "快炒", "咸鲜"], url: "https://thewoksoflife.com/chinese-chicken-broccoli-brown-sauce/", source: "The Woks of Life" },
  { name: "牛肉时蔬快炒", time: "30 分钟", protein: "牛肉", veg: "青菜 / 冰箱余菜", kcal: "约 420 kcal", tags: ["中式", "清冰箱", "快手"], url: "https://thewoksoflife.com/beef-vegetable-stir-fry/", source: "The Woks of Life" },
  { name: "鸡肉糙米蔬菜碗", time: "30 分钟", protein: "27g 蛋白质", veg: "胡萝卜、甜椒、毛豆", kcal: "460 kcal", tags: ["清爽", "一碗饭", "高蛋白"], url: "https://www.bbcgoodfood.com/recipes/chicken-veg-bowl", source: "Good Food" },
  { name: "奶香龙蒿鸡肉时蔬", time: "30 分钟", protein: "38g 蛋白质", veg: "西兰花、豌豆、西葫芦", kcal: "386 kcal", tags: ["西式", "一锅", "浓郁"], url: "https://www.bbcgoodfood.com/recipes/saucy-chicken-vegetables", source: "Good Food" },
  { name: "低卡西兰花炒鸡胸肉", time: "约 20 分钟", protein: "鸡胸肉", veg: "西兰花", kcal: "来源未标注", tags: ["抖音", "减脂", "家常"], url: "https://www.douyin.com/video/7125036796890713344", source: "抖音 · 晴晴妈教美食" },
  { name: "低温慢煮鸡胸配烤蔬菜", time: "65–90 分钟", protein: "鸡胸肉", veg: "土豆、胡萝卜、西兰花", kcal: "来源未标注", tags: ["抖音", "低温慢煮", "烤箱"], url: "https://jingxuan.douyin.com/m/video/7600354240497831222", source: "抖音精选 · 杜小兔" },
  { name: "凉拌牛肉", time: "约 2 小时", protein: "牛腱 / 牛后腿", veg: "洋葱、香菜、辣椒", kcal: "来源未标注", tags: ["抖音", "凉拌", "下饭"], url: "https://jingxuan.douyin.com/m/video/7647793794699611433", source: "抖音精选 · 美食强" },
  { name: "鸡胸土豆西兰花轻食", time: "约 30 分钟", protein: "鸡胸肉、鸡蛋", veg: "西兰花、小番茄", kcal: "按用量计算", tags: ["抖音", "轻食", "一人食"], url: "https://www.douyin.com/zhuanti/7626205700402055202", source: "抖音专题 · 轻食简餐" },
];

const seed: Record<string, Item[]> = { fridge: [], todos: [], someday: [], health: [], habits: [], meals: [], wishlist: [] };

export default function Home() {
  const [tab, setTab] = useState<Tab>("today");
  const [items, setItems] = useState(seed);
  const [modal, setModal] = useState<"fridge" | "todos" | "someday" | "health" | "habits" | "meals" | "wishlist" | null>(null);
  const [editing, setEditing] = useState<Item | null>(null);
  const [liked, setLiked] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState("");
  const [craving, setCraving] = useState("");
  const [dinnerIndex, setDinnerIndex] = useState(0);
  const [recipeCursor, setRecipeCursor] = useState(0);
  const [recipeMotion, setRecipeMotion] = useState<"left"|"right"|"up"|"">("");
  const [cookingIds, setCookingIds] = useState<number[]>([]);
  const [cooking, setCooking] = useState(false);
  const [health, setHealth] = useState({weight:"56.8", fat:"24.6", exercise:"320", sleep:"6.7"});
  const [habits, setHabits] = useState([{name:"做操",done:false},{name:"睡前放下手机",done:false},{name:"吃一份蔬菜",done:true}]);
  const [toast, setToast] = useState("");
  const [coverOpen, setCoverOpen] = useState(false);
  const [digitalActive, setDigitalActive] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [draggingTodo, setDraggingTodo] = useState<number | null>(null);
  const todayDate = new Date().toISOString().slice(0,10);
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [mealDate, setMealDate] = useState(todayDate);
  const [mealSlot, setMealSlot] = useState("晚饭");
  const [bedtime, setBedtime] = useState("22:40");
  const [petMessage, setPetMessage] = useState("今天也慢慢来，我会陪你记得休息。");
  const expiring = useMemo(() => items.fridge.filter((x) => x.meta.includes("1 天") || x.meta.includes("3 天")), [items]);
  const dinner = recipes[dinnerIndex];
  const dateStrip = useMemo(() => Array.from({length: 9}, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i - 2); return d.toISOString().slice(0,10); }), []);
  const plannedMeal = (items.meals || []).find(x => x.meta.split('|')[0] === mealDate && (!x.meta.includes('|') || x.meta.endsWith(mealSlot)));
  const todayMeals = (items.meals || []).filter(x=>x.meta.split('|')[0]===todayDate).sort((a,b)=>a.meta.localeCompare(b.meta));
  const filteredRecipes = recipes.filter(r => {
    const haystack = `${r.name} ${r.protein} ${r.veg} ${r.tags.join(" ")} ${r.source}`.toLowerCase();
    const ingredientWords = ingredients.toLowerCase().split(/[，,、\s]+/).filter(Boolean);
    const cravingWords = craving.toLowerCase().split(/[，,、\s]+/).filter(Boolean);
    return (!ingredientWords.length || ingredientWords.some(w=>haystack.includes(w))) && (!cravingWords.length || cravingWords.some(w=>haystack.includes(w)));
  });
  const deckRecipes = filteredRecipes.length ? filteredRecipes : recipes;
  const deckRecipe = deckRecipes[recipeCursor % deckRecipes.length];

  useEffect(() => {
    fetch("/api/records").then(r => r.ok ? r.json() : null).then(data => {
      if (!data?.records?.length) return;
      const saved = data.records.reduce((acc: Record<string, Item[]>, row: { id:number; type:string; title:string; detail:string; meta:string; position?:number; done?:boolean }) => {
        (acc[row.type] ||= []).push({ id: row.id, name: row.title, detail: row.detail, meta: row.meta, position: row.position || 0, done: !!row.done, kind: row.type === "fridge" ? "食材" : "" }); return acc;
      }, {});
      Object.keys(saved).forEach(key => saved[key].sort((a,b)=>(a.position||0)-(b.position||0) || b.id-a.id));
      setItems(v => ({ ...v, ...saved }));
    }).catch(() => {});
  }, []);

  useEffect(()=>{ const timer=window.setInterval(()=>{const now=new Date().toTimeString().slice(0,5);if(now===bedtime){setPetMessage("到休息时间啦。早点睡会让明天的食欲、情绪和训练恢复更稳定。");notify("睡觉搭子提醒你：该准备睡觉啦");}},60000);return()=>clearInterval(timer)},[bedtime]);

  useEffect(()=>{const update=()=>{const el=document.querySelector<HTMLElement>('.life-os');if(!el)return;const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);el.style.setProperty('--flow',String(Math.min(1,scrollY/max)))};addEventListener('scroll',update,{passive:true});update();return()=>removeEventListener('scroll',update)},[tab]);
  useEffect(()=>setHydrated(true),[]);

  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2200); }
  function remove(group: string, id: number) { setItems((v) => ({ ...v, [group]: v[group].filter((x) => x.id !== id) })); fetch(`/api/records?id=${id}`, { method: "DELETE" }).catch(()=>{}); notify("已删除，可继续添加新记录"); }
  function openEditor(group: "fridge" | "todos" | "someday" | "health" | "habits" | "meals" | "wishlist", item?: Item) { setEditing(item || null); setModal(group); }
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!modal) return;
    const data = new FormData(e.currentTarget); const name = String(data.get("name") || "").trim(); if (!name) return;
    let meta = String(data.get("meta") || "");
    if (modal === "fridge" && /^\d+$/.test(meta.trim())) { const expiry = new Date(); expiry.setDate(expiry.getDate() + Number(meta)); meta = expiry.toISOString().slice(0,10); }
    const next: Item = { id: editing?.id || Date.now(), name, detail: String(data.get("detail") || ""), meta, kind: modal === "todos" || modal === "someday" ? "" : String(data.get("kind") || "其他"), done: editing?.done, position: editing?.position ?? items[modal].length };
    setItems((v) => ({ ...v, [modal]: editing ? v[modal].map((x) => x.id === editing.id ? next : x) : [next, ...v[modal]] }));
    setModal(null); setEditing(null); notify(editing ? "修改已保存" : "记录已添加");
    fetch("/api/records", { method: editing ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: editing?.id, type: modal, title: next.name, detail: next.detail, meta: next.meta, position: next.position }) }).then(r=>r.json()).then(data=>{ if(data.record?.id && !editing) setItems(v=>({...v,[modal]:v[modal].map(x=>x.id===next.id?{...x,id:data.record.id}:x)})); }).catch(()=>{});
  }
  function previousHealth(item: Item){ return (items.health||[]).filter(x=>x.name===item.name&&x.id!==item.id&&x.meta<item.meta).sort((a,b)=>b.meta.localeCompare(a.meta))[0]; }
  function animateChoice(direction:"left"|"right"|"up") {
    setRecipeMotion(direction);
    if (direction === "right") notify(`喜欢：${deckRecipe.name}，以后会优先推荐相似菜谱`);
    if (direction === "up") addWishlist(deckRecipe);
    window.setTimeout(()=>{ setRecipeCursor(v=>v+1); setRecipeMotion(""); }, 280);
  }
  function addWishlist(recipe: typeof recipes[number]) {
    const temp: Item = {id:Date.now(), name:recipe.name, detail:recipe.url, meta:todayDate, kind:"菜谱"};
    setItems(v=>({...v,wishlist:[temp,...(v.wishlist||[])]}));
    fetch("/api/records",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({type:"wishlist",title:temp.name,detail:temp.detail,meta:temp.meta})}).catch(()=>{});
    notify("已放入最近想做");
  }
  function planRecipe(recipe: typeof recipes[number], date=mealDate) {
    const mealMeta = `${date}|${mealSlot}`;
    const old = (items.meals||[]).find(x=>x.meta===mealMeta);
    const temp: Item = {id:old?.id||Date.now(),name:recipe.name,detail:recipe.url,meta:mealMeta,kind:"菜单"};
    setItems(v=>({...v,meals:old?v.meals.map(x=>x.id===old.id?temp:x):[temp,...(v.meals||[])]}));
    fetch("/api/records",{method:old?"PUT":"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:old?.id,type:"meals",title:temp.name,detail:temp.detail,meta:mealMeta})}).catch(()=>{});
    setDinnerIndex(Math.max(0,recipes.findIndex(r=>r.name===recipe.name)));
    notify(`已安排到 ${date===todayDate?'今天':date} · ${mealSlot}`);
  }
  function startCooking(){ if(!cookingIds.length){notify("先勾选这次要用的食材");return;} setCooking(true); window.setTimeout(()=>{setCooking(false);notify("食材已加入本次烹饪；库存未自动删除，可在确认用完后手动修改");},1100); }
  function moveTodo(id:number, direction:-1|1){
    const dated = items.todos.filter(x=>x.meta===selectedDate); const index=dated.findIndex(x=>x.id===id); const swap=dated[index+direction]; if(!swap)return;
    const a=dated[index], aPos=a.position??index, bPos=swap.position??index+direction;
    setItems(v=>({...v,todos:v.todos.map(x=>x.id===a.id?{...x,position:bPos}:x.id===swap.id?{...x,position:aPos}:x).sort((x,y)=>(x.position||0)-(y.position||0))}));
    ;[a,swap].forEach((x,i)=>fetch("/api/records",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({id:x.id,type:"todos",title:x.name,detail:x.detail,meta:x.meta,position:i===0?bPos:aPos})}).catch(()=>{}));
  }
  function reorderTodoTo(sourceId:number,targetId:number){ const day=items.todos.filter(x=>x.meta===selectedDate).sort((a,b)=>(a.position||0)-(b.position||0)); const from=day.findIndex(x=>x.id===sourceId),to=day.findIndex(x=>x.id===targetId); if(from<0||to<0||from===to)return; const reordered=[...day]; const [moved]=reordered.splice(from,1); reordered.splice(to,0,moved); const positions=new Map(reordered.map((x,i)=>[x.id,i])); setItems(v=>({...v,todos:v.todos.map(x=>positions.has(x.id)?{...x,position:positions.get(x.id)}:x).sort((a,b)=>(a.position||0)-(b.position||0))})); reordered.forEach((x,i)=>fetch('/api/records',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({id:x.id,type:'todos',title:x.name,detail:x.detail,meta:x.meta,position:i,done:x.done})}).catch(()=>{})); }
  function toggleTodo(item:Item){ const done=!item.done; setItems(v=>({...v,todos:v.todos.map(x=>x.id===item.id?{...x,done}:x)})); fetch("/api/records",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({id:item.id,type:"todos",title:item.name,detail:item.detail,meta:item.meta,position:item.position||0,done})}).catch(()=>{}); }
  function expiryLabel(meta:string){ const target=new Date(`${meta}T23:59:59`); if(Number.isNaN(target.getTime()))return meta; const days=Math.ceil((target.getTime()-Date.now())/86400000); return days<0?`已过期 ${Math.abs(days)} 天`:days===0?'今天到期':`还剩 ${days} 天`; }

  const todayTodos = items.todos.filter(x=>x.meta===todayDate);
  const completedToday = todayTodos.filter(x=>x.done).length;
  const hour = new Date().getHours();
  const dayPhase = hour < 6 ? "夜还很深" : hour < 11 ? "早上好" : hour < 14 ? "中午好" : hour < 18 ? "下午好" : "晚上好";
  const weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate()+7); const weekEndDate=weekEnd.toISOString().slice(0,10); const weekTodos=items.todos.filter(x=>x.meta>todayDate&&x.meta<=weekEndDate).sort((a,b)=>a.meta.localeCompare(b.meta));
  const weightHistory = items.health.filter(x=>x.name.includes("体重")&&!Number.isNaN(parseFloat(x.detail))).sort((a,b)=>a.meta.localeCompare(b.meta));
  const weightValues = weightHistory.map(x=>parseFloat(x.detail)); const weightMin=weightValues.length?Math.min(...weightValues):0, weightMax=weightValues.length?Math.max(...weightValues):1;
  const weightPoints = weightHistory.map((x,i)=>`${weightHistory.length===1?50:(i/(weightHistory.length-1))*100},${92-((parseFloat(x.detail)-weightMin)/Math.max(1,weightMax-weightMin))*76}`).join(' ');

  if(!hydrated) return <main className="vita-boot" aria-label="VITA FLOW 正在载入"><span>VITA FLOW</span></main>;

  return <main className={`${tab==='today'?'immersive-mode':tab==='recipes'?'menu-mode':'records-mode'} module-${tab}`} onPointerMove={e=>{if(tab!=='today'&&tab!=='recipes')return;const el=e.currentTarget;el.style.setProperty('--mx',`${(e.clientX/window.innerWidth-.5)*2}`);el.style.setProperty('--my',`${(e.clientY/window.innerHeight-.5)*2}`);el.style.setProperty('--px',`${e.clientX/window.innerWidth*100}%`);el.style.setProperty('--py',`${e.clientY/window.innerHeight*100}%`)}}>
    <header className={`topbar ${tab==='today'?'life-nav':''}`}>
      <button className="brand" onClick={() => setTab("today")}><span>VITA FLOW</span><small>EAT WELL · MOVE WELL · LIVE WELL</small></button>
      <nav>{([['today','今日'],['todos','待办'],['recipes','菜谱'],['fridge','冰箱'],['health','健康']] as [Tab,string][]).map(([id,label]) => <button className={tab===id?'active':''} key={id} onClick={() => setTab(id)}>{label}</button>)}</nav>
    </header>

    {tab === "today" && <section className={`life-os phase-${hour<7?'night':hour<12?'morning':hour<18?'day':'evening'} ${coverOpen?'cover-open':''}`}>
      <div className="ambient-light one"/><div className="ambient-light two"/><div className="grain"/>
      <div className={`hover-cover digital-cover ${digitalActive?'is-interacting':''}`}>
        <div
          className="digital-portrait"
          aria-label="在人物上移动或拖动，查看数字皮肤"
          onPointerEnter={()=>setDigitalActive(true)}
          onPointerLeave={()=>setDigitalActive(false)}
          onPointerUp={()=>setDigitalActive(false)}
          onPointerCancel={()=>setDigitalActive(false)}
          onPointerMove={e=>{
            const box=e.currentTarget.getBoundingClientRect();
            const x=Math.max(0,Math.min(100,((e.clientX-box.left)/box.width)*100));
            const y=Math.max(0,Math.min(100,((e.clientY-box.top)/box.height)*100));
            e.currentTarget.style.setProperty('--local-x',`${x}%`);
            e.currentTarget.style.setProperty('--local-y',`${y}%`);
          }}
        >
          <div className="hover-base"/><div className="hover-world"/>
          <div className="digital-topology" aria-hidden="true">{Array.from({length:9},(_,i)=><i key={i}/>)}</div>
          <div className="hover-orbit" aria-hidden="true"/>
          <small className="portrait-hint">指到哪里，哪里会醒来</small>
        </div>
        <div className="lens-interface">
          <button className="lens-todo" onClick={()=>setTab('todos')}><small>01 / PLAN</small><b>今天的事</b><span>{todayTodos.length ? `${todayTodos.length} 件等待照看` : '今天还没有安排'}　↗</span></button>
          <button className="lens-fridge" onClick={()=>setTab('fridge')}><small>02 / SCAN</small><b>冰箱扫描</b><span>{expiring.length ? `${expiring.length} 样食材该先吃` : `${items.fridge.length} 样食材在冰箱`}　↗</span></button>
          <button className="lens-recipe" onClick={()=>setTab('recipes')}><small>03 / TASTE</small><b>{todayMeals.length?todayMeals.map(x=>x.name).join(' · '):deckRecipe.name}</b><span>{todayMeals.length?`今天已安排 ${todayMeals.length} 顿`:'从真实菜谱里挑选'}　↗</span></button>
          <button className="lens-health" onClick={()=>setTab('health')}><small>04 / LOG</small><b>身体记录</b><span>{items.health.length ? `${items.health.length} 条历史记录` : '留下第一条真实数据'}　↗</span></button>
        </div>
        <div className="digital-readout" aria-hidden="true"><span>REAL / 00</span><i/><span>DIGITAL / 01</span></div>
        <div className="hover-word"><small>VITA FLOW / DIGITAL SELF</small><b>今天，<br/>从这里开始。</b><i>YOUR LIFE, IN MOTION</i></div>
        <button onClick={()=>setCoverOpen(true)}>进入今天 <span>↘</span></button>
      </div>
      <div className="signal-cover" aria-hidden="true"><div className="signal-field">{Array.from({length:36},(_,i)=><i key={i} style={{'--n':i} as React.CSSProperties}/>)}</div><div className="signal-horizon"><span>睡眠</span><span>饮食</span><span>行动</span><span>恢复</span></div><div className="liquid-reveal"><b>YOUR<br/>DAY</b><small>{todayTodos.length} TASKS / {plannedMeal?'MEAL SET':'MENU OPEN'} / {items.health.length} RECORDS</small></div></div>
      <div className="edit-stage" aria-label="今日生活剪辑台">
        <div className="edit-top"><span>VITA CUT / 001</span><time>{String(hour).padStart(2,'0')}:{String(new Date().getMinutes()).padStart(2,'0')}:24</time></div>
        <div className="edit-window" aria-hidden="true"><b>TO<br/>DAY</b><i/><i/><i/><span>正在把今天<br/>剪成你喜欢的样子</span></div>
        <div className="edit-tracks">
          <button onClick={()=>setTab('todos')}><small>A1</small><span>待办</span><b>{todayTodos.length.toString().padStart(2,'0')}</b></button>
          <button onClick={()=>setTab('recipes')}><small>V1</small><span>{todayMeals.length?`${todayMeals.length} 顿已安排`:'今日菜单'}</span><b>FOOD</b></button>
          <button onClick={()=>setTab('fridge')}><small>V2</small><span>{expiring.length?`${expiring.length} 样先吃`:'冰箱库存'}</span><b>KEEP</b></button>
          <button onClick={()=>setTab('health')}><small>A2</small><span>身体记录</span><b>SYNC</b></button>
        </div>
        <div className="edit-playhead" aria-hidden="true"><i/><span/></div>
        <div className="edit-bottom"><span>▶ PLAYING TODAY</span><b>拖动生活，而不是完成生活</b></div>
      </div>
      <div className="kinetic-mark" aria-hidden="true"><span>FLOW</span><span>FLOW</span></div>
      <aside className="time-spine" aria-hidden="true"><span>NOW</span><i/><b>{String(hour).padStart(2,'0')}</b><small>24</small></aside>
      <section className="life-opening">
        <p className="life-date">{new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})}</p>
        <div className="life-title"><span>{dayPhase}</span><h1>今天。</h1><p>不必把生活全部完成。<br/>只需要听见它正在发生。</p></div>
        <div className="daily-command" aria-label="今日快捷入口">
          <button onClick={()=>setTab('todos')}><small>01</small><span>安排今天</span><b>{todayTodos.length} 件事</b></button>
          <button onClick={()=>setTab('recipes')}><small>02</small><span>决定吃什么</span><b>{todayMeals.length?todayMeals.map(x=>x.meta.split('|')[1]||'餐').join('、'):'还没选'}</b></button>
          <button onClick={()=>setTab('fridge')}><small>03</small><span>先吃掉什么</span><b>{expiring.length?`${expiring.length} 样快过期`:'查看冰箱'}</b></button>
          <button onClick={()=>setTab('health')}><small>04</small><span>记录身体</span><b>留下真实数据</b></button>
        </div>
        <button className="scroll-whisper" onClick={()=>document.getElementById('life-now')?.scrollIntoView({behavior:'smooth'})}><i/>向今天深处</button>
      </section>

      <div className="flow-ticker" aria-hidden="true"><div><span>EAT WITH INTENTION</span><i>✦</i><span>MOVE WITH ENERGY</span><i>✦</i><span>REST WITHOUT GUILT</span><i>✦</i><span>EAT WITH INTENTION</span><i>✦</i></div></div>

      <section className="life-now" id="life-now">
        <p className="chapter">01 / 此刻</p>
        <div className="now-sentence"><span>你今天有</span><button onClick={()=>setTab('todos')}>{todayTodos.length} 件事</button><span>要完成，</span><br/><span>已经完成</span><strong>{completedToday}</strong><span>件。</span></div>
        <div className="task-stream">{todayTodos.length?todayTodos.slice(0,4).map((x,i)=><button key={x.id} style={{'--delay':`${i*.08}s`} as React.CSSProperties} onClick={()=>setItems(v=>({...v,todos:v.todos.map(t=>t.id===x.id?{...t,done:!t.done}:t)}))}><i className={x.done?'complete':''}/><span>{x.name}</span><small>{x.kind}</small></button>):<button onClick={()=>{setSelectedDate(todayDate);openEditor('todos')}}><i/><span>今天还很安静</span><small>写下第一件想做的事</small></button>}</div>
      </section>

      <section className="life-table">
        <p className="chapter">02 / 滋养</p>
        <div className="table-scene">
          <button className="sun-object" onClick={()=>setTab('health')} aria-label="进入身体状态"><span/><b>身体</b><small>{(items.health||[]).filter(x=>x.meta===todayDate).length?`${(items.health||[]).filter(x=>x.meta===todayDate).length} 条真实记录`:'等待你记录'}</small></button>
          <button className="meal-object" onClick={()=>setTab('recipes')} aria-label="进入今天的菜单"><i/><i/><i/><strong>{todayMeals.length?todayMeals.map(x=>`${x.meta.split('|')[1]||'餐'}：${x.name}`).join(' · '):'今天吃什么？'}</strong><small>{todayMeals.length?`今天共安排 ${todayMeals.length} 顿`:'从真实菜谱里慢慢挑'}</small></button>
          <button className="leaf-object" onClick={()=>setTab('fridge')} aria-label="进入冰箱"><span/><b>冰箱</b><small>{expiring.length?`${expiring.length} 样食材该先吃`:`${items.fridge.length} 样食材`}</small></button>
        </div>
        <p className="life-insight">{expiring.length?`${expiring.map(x=>x.name).join('、')}正在接近最佳食用时间。今天的菜单可以先从它们开始。`:'当冰箱、饮食和身体记录慢慢积累，VITA 才会开始发现属于你的联系。'}</p>
      </section>

      <section className="life-river">
        <p className="chapter">03 / 接下来</p>
        <h2>生活不只发生在今天。</h2>
        <div className="horizon"><button onClick={()=>{const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);setSelectedDate(tomorrow.toISOString().slice(0,10));setTab('todos')}}><span>明天</span><small>{weekTodos.filter(x=>{const d=new Date();d.setDate(d.getDate()+1);return x.meta===d.toISOString().slice(0,10)}).length?`${weekTodos.filter(x=>{const d=new Date();d.setDate(d.getDate()+1);return x.meta===d.toISOString().slice(0,10)}).length} 件已安排`:'还没有安排'}</small></button><button onClick={()=>{if(weekTodos[0])setSelectedDate(weekTodos[0].meta);setTab('todos')}}><span>本周</span><small>{weekTodos.length?`${weekTodos.length} 件：${weekTodos.slice(0,2).map(x=>x.name).join('、')}`:'未来 7 天暂无安排'}</small></button><button onClick={()=>setTab('health')}><span>最近</span><small>从真实记录里寻找变化</small></button><button onClick={()=>openEditor('wishlist')}><span>以后</span><small>{(items.wishlist||[]).length?`${items.wishlist.length} 道想做的菜`:'收下一件想做的事'}</small></button></div>
      </section>

      <section className="life-rest">
        <div className="night-orbit"><span/><i/><b/></div>
        <p className="chapter">04 / 夜晚</p><h2>今天会慢慢熄灯。<br/>你不需要带着所有事情入睡。</h2>
        <button onClick={()=>setTab('health')}>进入夜间节奏 <span>→</span></button>
        <small>睡眠提醒设在 {bedtime}</small>
      </section>
      <footer className="life-footer"><span>VITA FLOW</span><small>A LIFE OPERATING SYSTEM THAT GROWS WITH YOU</small></footer>
    </section>}

    {tab === "recipes" && <section className="page"><div className="section-head"><div><p className="eyebrow">真实来源 · 由你做决定</p><h1>像挑卡片一样找今天想吃的</h1></div><button className="primary" onClick={()=>openEditor('wishlist')}>＋ 保存外部菜谱链接</button></div><div className="recipe-finder"><label>我有什么菜<input value={ingredients} onChange={e=>{setIngredients(e.target.value);setRecipeCursor(0)}} placeholder="例如：鸡肉、西兰花、番茄"/></label><label>我想吃什么<input value={craving} onChange={e=>{setCraving(e.target.value);setRecipeCursor(0)}} placeholder="例如：香辣、清淡、牛肉、凉拌"/></label><b>找到 {filteredRecipes.length} 个选择</b><label>安排到哪天<input type="date" value={mealDate} onChange={e=>setMealDate(e.target.value)}/></label><div className="meal-slot-switch"><span>哪一顿</span><button className={mealSlot==='午饭'?'active':''} onClick={()=>setMealSlot('午饭')}>午饭</button><button className={mealSlot==='晚饭'?'active':''} onClick={()=>setMealSlot('晚饭')}>晚饭</button></div></div><section className="meal-schedule"><div><small>MEAL SCHEDULE</small><h2>已经安排的饮食</h2></div><div>{!(items.meals||[]).length&&<p>还没有安排任何一餐。</p>}{(items.meals||[]).sort((a,b)=>a.meta.localeCompare(b.meta)).map(x=><article key={x.id}><time>{x.meta.split('|')[0]}</time><b>{x.meta.split('|')[1]||'未分餐次'}</b><span>{x.name}</span><div className="row-actions"><button onClick={()=>{setMealDate(x.meta.split('|')[0]);setMealSlot(x.meta.split('|')[1]||'晚饭')}}>查看</button><button onClick={()=>remove('meals',x.id)}>删除</button></div></article>)}</div></section><div className="recipe-deck"><article className={`deck-card ${recipeMotion}`}><div className="deck-visual">{deckRecipe.protein.includes("牛")?'🥩':'🍗'}<span>🥬</span></div><div><p>{deckRecipe.tags.map(t=><span className="pill" key={t}>{t}</span>)}</p><h2>{deckRecipe.name}</h2><p>{deckRecipe.protein} · {deckRecipe.veg}</p><small>{deckRecipe.source} · {deckRecipe.kcal}</small><a href={deckRecipe.url} target="_blank">先看原教程 ↗</a></div></article><div className="deck-actions"><button onClick={()=>animateChoice('left')}><span>×</span>不合口味</button><button onClick={()=>animateChoice('up')}><span>♡</span>最近想做</button><button className="like" onClick={()=>animateChoice('right')}><span>♥</span>喜欢</button><button className="plan" onClick={()=>planRecipe(deckRecipe)}><span>＋</span>安排到 {mealDate===todayDate?'今天':mealDate.slice(5)} · {mealSlot}</button></div><p>每一次跳过、喜欢和收藏都是一次口味测试；你不需要再单独“保存口味”。</p></div><div className="cards">{filteredRecipes.map((r)=><article className="recipe-card" key={r.name}><div className="card-art">{r.protein.includes("牛")?'🥩':'🍗'} <span>＋</span> 🥬</div><p>{r.tags.map(t=><span className="pill" key={t}>{t}</span>)}</p><h3>{r.name}</h3><small>{r.protein} · {r.kcal}</small><div className="card-actions"><a href={r.url} target="_blank">查看 {r.source} ↗</a><button onClick={()=>planRecipe(r)}>安排到所选日期</button></div></article>)}</div><p className="source-note">菜谱均链接到原始发布页面；来源未提供营养数据时，不伪造精确热量。</p></section>}

    {tab === "fridge" && <section className="page"><div className="section-head"><div><p className="eyebrow">减少浪费</p><h1>冰箱里还剩什么</h1></div><button className="primary" onClick={()=>openEditor("fridge")}>＋ 添加食材</button></div>{!items.fridge.length&&<div className="tip"><b>冰箱现在是空白的</b><p>从你亲自添加第一样食材开始记录，不再放示例库存。</p></div>}<div className="fridge-stage"><div className="fridge-door"><span>VITA 冰箱</span><div className="inventory">{items.fridge.map(x=><article className={cookingIds.includes(x.id)?'selected-food':''} key={x.id}><label className="food-pick"><input type="checkbox" checked={cookingIds.includes(x.id)} onChange={()=>setCookingIds(v=>v.includes(x.id)?v.filter(id=>id!==x.id):[...v,x.id])}/><span>本次要用</span></label><div className="food-icon">{x.kind.includes('肉')?'🥩':'🥬'}</div><div><span className="pill">{x.kind}</span><h3>{x.name}</h3><p>{x.detail}</p><b className={expiryLabel(x.meta).includes('今天')||expiryLabel(x.meta).includes('过期')?'urgent':''}>{expiryLabel(x.meta)}</b></div><div className="row-actions"><button onClick={()=>openEditor("fridge",x)}>编辑</button><button onClick={()=>remove("fridge",x.id)}>删除</button></div></article>)}</div></div><button className="cook-pot" onClick={startCooking}><span className={cooking?'pot-bubble':''}>🍲</span><b>{cooking?'正在下锅…':`把 ${cookingIds.length||'所选'} 样食材下锅`}</b></button></div></section>}

    {tab === "health" && <section className="page"><div className="section-head"><div><h1>今日健康记录</h1><p>选择今天的日期填写，保存后才会进入历史并用于下次对比。</p></div><button className="primary" onClick={()=>openEditor("health")}>＋ 添加一次记录</button></div>{!(items.health||[]).length?<div className="tip"><b>还没有记录</b><p>体重、体脂、睡眠和运动都由你第一次填写后才产生历史，不再显示示例数字。</p></div>:<div className="inventory">{items.health.map(x=><article key={x.id}><div><span className="pill">{x.kind}</span><h3>{x.name}</h3><p>{x.detail}</p><b>{x.meta}</b><small>{previousHealth(x)?`上一次：${previousHealth(x)?.detail}（${previousHealth(x)?.meta}）`:'这是第一次记录'}</small></div><div className="row-actions"><button onClick={()=>openEditor("health",x)}>编辑</button><button onClick={()=>remove("health",x.id)}>删除</button></div></article>)}</div>}<div className="weight-chart"><div><small>WEIGHT HISTORY</small><h2>体重变化</h2><p>{weightHistory.length?`${weightHistory.length} 次真实记录`:'添加体重记录后生成折线图'}</p></div>{weightHistory.length>0&&<div className="chart-canvas"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="体重历史折线图"><polyline points={weightPoints}/>{weightHistory.map((x,i)=><circle key={x.id} cx={weightHistory.length===1?50:(i/(weightHistory.length-1))*100} cy={92-((parseFloat(x.detail)-weightMin)/Math.max(1,weightMax-weightMin))*76} r="1.8"/>)}</svg><div className="chart-labels">{weightHistory.map(x=><span key={x.id}><b>{parseFloat(x.detail)}</b><small>{x.meta.slice(5)}</small></span>)}</div></div>}</div><div className="checkin"><div><h2>压力与身体状态</h2><p>未来从 StressWatch 按时间段读取 HRV、静息心率、睡眠和训练数据，再分析与进食、咖啡因的关系；现在不会编造压力值。</p></div></div><div className="sleep-pet sleep-rhythm"><div className="rhythm-orb"><i/><i/><i/></div><div><h2>夜间节奏</h2><p>{petMessage}</p><label>提醒时间 <input type="time" value={bedtime} onChange={e=>setBedtime(e.target.value)}/></label><div className="pet-actions"><button onClick={()=>setPetMessage("早点睡，明天会更有精神，饥饿感和压力也更容易稳定。")}>给我一句睡前提醒</button><button onClick={()=>openEditor("habits")}>添加睡前习惯</button></div></div></div></section>}

    {tab === "todos" && <section className="page"><div className="section-head"><div><h1>日历待办</h1></div><button className="primary" onClick={()=>openEditor("todos")}>＋ 添加到所选日期</button></div><div className="calendar-bar"><button onClick={()=>setSelectedDate(todayDate)}>回到今天</button><input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)}/><b>{selectedDate===todayDate?"今天":selectedDate}</b></div><div className="todo-day"><h2>这一天的安排</h2>{!items.todos.filter(x=>x.meta===selectedDate).length&&<p>这一天还没有待办。</p>}{items.todos.filter(x=>x.meta===selectedDate).sort((a,b)=>(a.position||0)-(b.position||0)).map((x,i,dayItems)=><article key={x.id} draggable onDragStart={()=>setDraggingTodo(x.id)} onDragOver={e=>e.preventDefault()} onDrop={()=>{if(draggingTodo)reorderTodoTo(draggingTodo,x.id);setDraggingTodo(null)}} className={draggingTodo===x.id?"dragging":""}><span className="drag-handle" title="拖动调整顺序">⠿</span><label><input type="checkbox" checked={!!x.done} onChange={()=>toggleTodo(x)}/><span className={x.done?"done":""}><b>{x.name}</b>{x.detail&&<small>{x.detail}</small>}</span></label><div className="row-actions order-actions"><button disabled={i===0} onClick={()=>moveTodo(x.id,-1)}>↑</button><button disabled={i===dayItems.length-1} onClick={()=>moveTodo(x.id,1)}>↓</button><button onClick={()=>openEditor("todos",x)}>编辑</button><button onClick={()=>remove("todos",x.id)}>删除</button></div></article>)}</div><section className="someday-section"><div><small>OPEN LIST</small><h2>最近可做的事</h2><p>不绑定日期，会一直保留；删掉就代表已经完成。</p></div><button className="primary" onClick={()=>openEditor("someday")}>＋ 添加</button></section><div className="someday-list">{!(items.someday||[]).length&&<p>还没有最近可做的事。</p>}{(items.someday||[]).map(x=><article key={x.id}><div><h3>{x.name}</h3>{x.detail&&<p>{x.detail}</p>}</div><div className="row-actions"><button onClick={()=>openEditor("someday",x)}>编辑</button><button onClick={()=>remove("someday",x.id)}>完成并删除</button></div></article>)}</div><h2>习惯（不要求连续）</h2><div className="inventory">{(items.habits||[]).map(x=><article key={x.id}><div><h3>{x.name}</h3><p>{x.detail}</p></div><div className="row-actions"><button onClick={()=>openEditor("habits",x)}>编辑</button><button onClick={()=>remove("habits",x.id)}>删除</button></div></article>)}<button className="empty-add" onClick={()=>openEditor("habits")}>＋ 添加习惯</button></div></section>}

    {modal && <div className="overlay" onMouseDown={()=>setModal(null)}><form className="modal" onSubmit={save} onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><h2>{editing?'编辑':'新增'}记录</h2><button type="button" onClick={()=>setModal(null)}>×</button></div><label>名称或指标<input name="name" defaultValue={editing?.name} placeholder={modal==='health'?'例如：体重 / 体脂率 / 睡眠':'输入名称'} autoFocus/></label><label>{modal==='wishlist'?'菜谱原始链接':modal==='fridge'?'购买信息或备注':'数值或说明'}<input type={modal==='wishlist'?'url':'text'} name="detail" defaultValue={editing?.detail} placeholder={modal==='health'?'例如：56.8 kg':'输入详细内容'}/></label><div className="form-row"><label>{modal==='todos'?'日期':modal==='fridge'?'还有几天过期':'日期'}<input name="meta" defaultValue={editing?.meta||(modal==='todos'?selectedDate:modal==='fridge'?'':todayDate)} placeholder={modal==='fridge'?'例如：2':'2026-08-03'}/></label><label>由你分类<input name="kind" defaultValue={editing?.kind} placeholder={modal==='todos'?'学习 / 生活':'输入分类'}/></label></div><button className="primary" type="submit">保存</button></form></div>}
    {toast && <div className="toast">✓ {toast}</div>}
  </main>;
}
