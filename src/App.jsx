import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const CY = "#89dceb", CYD = "#4a9aab", CYL = "#89dceb18", CYB = "#89dceb44";
const PK = "#f38ba8", PKD = "#a3506a", PKL = "#f38ba818", PKB = "#f38ba844";
const PU = "#cba6f7", PUL = "#cba6f718", PUB = "#cba6f744";
const GR = "#a6e3a1", GRL = "#a6e3a118", GRB = "#a6e3a144";
const AM = "#f9e2af", AML = "#f9e2af18", AMB = "#f9e2af44";
const BG = "#1e1e2e", CA = "#181825", BD = "#313244", BD2 = "#45475a";
const T1 = "#ffffff", T2 = "#c8cdd8", T3 = "#9aa0b2", T4 = "#7a8194";

const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const epley = (w, r) => (w && r) ? Math.round(Number(w) * (1 + Number(r) / 30)) : 0;
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const weekStartStr = () => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().split("T")[0]; };
const emptyEx = () => ({ name: "", sets: Array(4).fill(null).map(() => ({ w: "", r: "" })) });

const inp = { background: BG, border: `0.5px solid ${BD2}`, borderRadius: 20, color: T1, fontSize: 13, padding: "6px 12px", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "'Courier New', monospace" };
const inpFlat = { background: BG, border: `0.5px solid ${BD2}`, borderRadius: 8, color: T1, fontSize: 13, padding: "5px 8px", outline: "none", width: "100%", boxSizing: "border-box", textAlign: "center", fontFamily: "'Courier New', monospace" };
const card = { background: CA, border: `0.5px solid ${BD}`, borderRadius: 12 };
const lbl = { fontSize: 12, color: T2, marginBottom: 3, fontWeight: 500 };
const bcy = { background: CYL, color: CY, border: `0.5px solid ${CYB}`, borderRadius: 10, fontSize: 12, padding: "1px 8px", fontWeight: 700 };
const bpk = { background: PKL, color: PK, border: `0.5px solid ${PKB}`, borderRadius: 10, fontSize: 12, padding: "1px 8px", fontWeight: 700 };
const comment = { fontSize: 13, color: PK, marginBottom: 6, fontWeight: 500 };

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: CA, border: `0.5px solid ${BD}`, borderRadius: 8, padding: "6px 10px", fontSize: 13, fontFamily: "'Courier New', monospace" }}>
      <div style={{ color: T3, marginBottom: 3 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color, fontWeight: 500 }}>{p.name}: {Number(p.value).toFixed(1)}</div>)}
    </div>
  );
};

const CardHead = ({ iconBg, iconColor, icon, title, sub, badge }) => (
  <div style={{ padding: "9px 12px", display: "flex", alignItems: "center", gap: 9, borderBottom: `0.5px solid ${BD}` }}>
    <div style={{ width: 30, height: 30, borderRadius: "50%", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <i className={`ti ${icon}`} style={{ fontSize: 13, color: iconColor }} aria-hidden="true" />
    </div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, color: T1 }}>{title}</div>
      {sub && <div style={{ fontSize: 13, color: T3, marginTop: 1 }}>{sub}</div>}
    </div>
    {badge && <div style={{ marginLeft: "auto" }}>{badge}</div>}
  </div>
);

export default function App() {
  const [tab, setTab] = useState("today");
  const [ready, setReady] = useState(false);
  const [setupDone, setSetupDone] = useState(false);
  const [profile, setProfile] = useState({ age: "", height: "" });
  const [bodyDay, setBodyDay] = useState(1);
  const [logs, setLogs] = useState([]);
  const [bodyLogs, setBodyLogs] = useState([]);
  const [cardio, setCardio] = useState({ type: "", duration: "", distance: "" });
  const [exercises, setExercises] = useState([emptyEx()]);
  const [workoutParts, setWorkoutParts] = useState([]);
  const [sleep, setSleep] = useState({ score: "", inBed: "", actual: "" });
  const [energy, setEnergy] = useState(0);
  const [diet, setDiet] = useState({ morning: "", lunch: "", dinner: "", snack: "" });
  const [note, setNote] = useState("");
  const [bodyInput, setBodyInput] = useState({ weight: "", muscle: "", fat: "", fatRate: "" });
  const [showBodyForm, setShowBodyForm] = useState(false);
  const [coaching, setCoaching] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [savedToday, setSavedToday] = useState(false);
  const [expandLog, setExpandLog] = useState(null);

  const td = todayStr();

  useEffect(() => {
    try {
      const p = localStorage.getItem("fl_profile");
      if (p) { setProfile(JSON.parse(p)); setSetupDone(true); } else { setReady(true); return; }
      try { const bd = localStorage.getItem("fl_bodyDay"); if (bd) setBodyDay(parseInt(bd)); } catch(_) {}
      try { const l = localStorage.getItem("fl_logs"); if (l) setLogs(JSON.parse(l)); } catch(_) {}
      try { const bl = localStorage.getItem("fl_bodyLogs"); if (bl) setBodyLogs(JSON.parse(bl)); } catch(_) {}
      try {
        const tl = localStorage.getItem("fl_log_" + td);
        if (tl) {
          const d = JSON.parse(tl);
          if (d.cardio) setCardio(d.cardio);
          if (d.exercises) setExercises(d.exercises);
          if (d.workoutParts) setWorkoutParts(d.workoutParts);
          if (d.sleep) setSleep(d.sleep);
          if (d.energy !== undefined) setEnergy(d.energy);
          if (d.diet) setDiet(d.diet);
          if (d.note) setNote(d.note);
          if (d.coaching) setCoaching(d.coaching);
          setSavedToday(true);
        }
      } catch(_) {}
    } catch(_) {}
    setReady(true);
  }, []);

  const isBodyDay = new Date().getDay() === bodyDay;
  const upExName = (i, v) => { const e = [...exercises]; e[i] = { ...e[i], name: v }; setExercises(e); };
  const upSet = (ei, si, f, v) => { const e = [...exercises]; const sets = [...e[ei].sets]; sets[si] = { ...sets[si], [f]: v }; e[ei] = { ...e[ei], sets }; setExercises(e); };
  const getVol = (ex) => ex.sets.reduce((s, st) => (st.w && st.r ? s + Number(st.w) * Number(st.r) : s), 0);
  const getMaxRM = (ex) => ex.sets.reduce((m, st) => Math.max(m, epley(st.w, st.r)), 0);

  const saveProfile = () => {
    localStorage.setItem("fl_profile", JSON.stringify(profile));
    localStorage.setItem("fl_bodyDay", String(bodyDay));
    setSetupDone(true);
  };

  const saveLog = async () => {
    const logData = { date: td, cardio, exercises, workoutParts, sleep, energy, diet, note };
    const newLogs = [...logs.filter(l => l.date !== td), logData];
    setLogs(newLogs);
    localStorage.setItem("fl_logs", JSON.stringify(newLogs));
    if (showBodyForm && bodyInput.weight) {
      const newBL = [...bodyLogs.filter(b => b.date !== td), { date: td, ...bodyInput }];
      setBodyLogs(newBL);
      localStorage.setItem("fl_bodyLogs", JSON.stringify(newBL));
    }
    setCoachLoading(true);
    try {
      const exSum = exercises.filter(e => e.name).map(e => `${e.name}(볼륨${getVol(e).toFixed(0)}kg, 1RM ${getMaxRM(e)}kg)`).join(" / ") || "없음";

      const now = new Date();
      const oneWeekAgo = new Date(now); oneWeekAgo.setDate(now.getDate() - 7);
      const oneMonthAgo = new Date(now); oneMonthAgo.setDate(now.getDate() - 30);
      const weekLogs = logs.filter(l => new Date(l.date) >= oneWeekAgo);
      const monthLogs = logs.filter(l => new Date(l.date) >= oneMonthAgo);
      const avgEnergy = (arr) => arr.filter(l=>l.energy).length ? (arr.reduce((s,l)=>s+(l.energy||0),0)/arr.filter(l=>l.energy).length).toFixed(1) : "없음";
      const avgSleep = (arr) => arr.filter(l=>l.sleep?.actual).length ? (arr.reduce((s,l)=>s+(parseFloat(l.sleep?.actual)||0),0)/arr.filter(l=>l.sleep?.actual).length).toFixed(1) : "없음";
      const workoutCount = (arr) => arr.filter(l=>l.cardio?.type||(l.exercises||[]).some(e=>e.name)).length;

      // 마지막 운동일로부터 며칠째 안 했는지
      const allWorkoutDates = logs
        .filter(l=>l.cardio?.type||(l.exercises||[]).some(e=>e.name))
        .map(l=>l.date).sort().reverse();
      const lastWorkoutDate = allWorkoutDates[0];
      const daysSinceWorkout = lastWorkoutDate
        ? Math.floor((now - new Date(lastWorkoutDate)) / 86400000)
        : 99;

      const prompt = `당신은 전문 PT 트레이너입니다. 오늘 기록과 최근 1주일, 1개월 데이터를 비교 분석해서 한국어 존댓말로 코칭해주세요. 이모티콘 사용 금지.

[오늘 기록]
사용자: 나이 ${profile.age||"?"}세, 키 ${profile.height||"?"}cm
유산소: ${cardio.type||"없음"}${cardio.duration?" "+cardio.duration+"분":""}${cardio.distance?" "+cardio.distance+"km":""}
웨이트: ${exSum}
수면점수: ${sleep.score||"미입력"}, 수면시간: ${sleep.inBed||"미입력"}시간, 실수면시간: ${sleep.actual||"미입력"}시간
에너지 레벨: ${energy}/5점
식단: 아침(${diet.morning||"미입력"}) 점심(${diet.lunch||"미입력"}) 저녁(${diet.dinner||"미입력"}) 간식(${diet.snack||"미입력"})
한줄평: ${note||"없음"}

[최근 1주일 요약 (${weekLogs.length}일 기록)]
운동 횟수: ${workoutCount(weekLogs)}회
평균 에너지: ${avgEnergy(weekLogs)}/5점
평균 실수면시간: ${avgSleep(weekLogs)}시간

[최근 1개월 요약 (${monthLogs.length}일 기록)]
운동 횟수: ${workoutCount(monthLogs)}회
평균 에너지: ${avgEnergy(monthLogs)}/5점
평균 실수면시간: ${avgSleep(monthLogs)}시간

${daysSinceWorkout >= 3 ? `
[경고] 마지막 운동으로부터 ${daysSinceWorkout}일이 지났습니다. 운동 미실시 상태입니다.` : ''}

위 데이터를 바탕으로 3문장으로 피드백해주세요:
1. 오늘 잘한 점 (운동을 ${daysSinceWorkout}일째 안 했다면 잘한 점 대신 강하게 질책해주세요. 변명 여지 없이 직설적으로, 독하게. 운동의 중요성과 지금 당장 해야 하는 이유를 말해주세요)
2. 이번 주 vs 이번 달 트렌드 비교
3. 내일/이번 주 개선 조언`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const c = data.content?.[0]?.text || "코칭 생성 실패";
      setCoaching(c);
      localStorage.setItem("fl_log_" + td, JSON.stringify({ ...logData, coaching: c }));
    } catch(_) { setCoaching("코칭 생성 중 오류가 발생했어요."); }
    setCoachLoading(false);
    setSavedToday(true);
  };

  const getAllMax = () => {
    const r = {};
    logs.forEach(log => (log.exercises||[]).forEach(ex => { if (!ex.name) return; const rm = getMaxRM(ex); if (rm > (r[ex.name]||0)) r[ex.name] = rm; }));
    return r;
  };

  const bodyChartData = bodyLogs.slice(-10).map(b => ({ date: b.date.slice(5), weight: parseFloat(b.weight)||undefined, fat: parseFloat(b.fatRate)||undefined }));
  const volChartData = logs.slice(-10).map(l => ({ date: l.date.slice(5), vol: Math.round((l.exercises||[]).reduce((s,e) => s+getVol(e),0)) })).filter(d => d.vol > 0);
  const thisWeek = logs.filter(l => l.date >= weekStartStr()).length;
  const lastBody = bodyLogs[bodyLogs.length-1];
  const prevBody = bodyLogs[bodyLogs.length-2];
  const wDelta = lastBody && prevBody ? (parseFloat(lastBody.weight)-parseFloat(prevBody.weight)).toFixed(1) : null;
  const now2 = new Date(); const year = now2.getFullYear(); const month = now2.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const logDates = new Set(logs.filter(l => l.cardio?.type || (l.exercises||[]).some(e => e.name)).map(l => l.date));
  const recentDates = [];
  for (let i = 1; i <= 6; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    if (logDates.has(ds)) recentDates.push({ ds, day: DAYS_SHORT[d.getDay()] });
  }

  if (!ready) return <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: T3, fontSize: 13, fontFamily: "'Courier New', monospace" }}>// Loading...</div>;

  if (!setupDone) return (
    <div style={{ background: BG, minHeight: "100vh", padding: 20, fontFamily: "'Courier New', monospace" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", paddingTop: 40 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 500, color: T1, marginBottom: 4 }}>Fit<span style={{ color: CY }}>Log</span><span style={{ color: PK }}>.</span></div>
          <div style={{ fontSize: 13, color: T3 }}>// 시작 전에 기본 정보를 입력해주세요</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ ...card, padding: "12px 14px" }}><div style={lbl}>나이</div><input style={inp} type="number" placeholder="26" value={profile.age} onChange={e => setProfile({ ...profile, age: e.target.value })} /></div>
          <div style={{ ...card, padding: "12px 14px" }}><div style={lbl}>키 (cm)</div><input style={inp} type="number" placeholder="165" value={profile.height} onChange={e => setProfile({ ...profile, height: e.target.value })} /></div>
          <div style={{ ...card, padding: "12px 14px" }}>
            <div style={{ ...lbl, marginBottom: 8 }}>신체 지표 측정 요일</div>
            <div style={{ display: "flex", gap: 5 }}>
              {DAYS_SHORT.map((d, i) => <button key={i} onClick={() => setBodyDay(i)} style={{ flex: 1, padding: "7px 0", background: bodyDay===i ? CYL : BG, color: bodyDay===i ? CY : T3, border: `0.5px solid ${bodyDay===i ? CYB : BD2}`, borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: bodyDay===i ? 700 : 400, fontFamily: "'Courier New', monospace" }}>{d}</button>)}
            </div>
          </div>
          <button onClick={saveProfile} style={{ background: CYL, color: CY, border: `0.5px solid ${CYB}`, borderRadius: 24, padding: "12px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>시작하기 →</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Courier New', monospace" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>

        {/* 상단 타이틀바 */}
        <div style={{ background: CA, borderBottom: `0.5px solid ${BD}`, padding: "9px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: T1, letterSpacing: -0.5 }}>Fit<span style={{ color: CY }}>Log</span><span style={{ color: PK }}>.</span></div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <i className="ti ti-bell" style={{ fontSize: 20, color: T2 }} aria-hidden="true" />
            <button onClick={() => setSetupDone(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1 }}><i className="ti ti-settings" style={{ fontSize: 20, color: T2 }} aria-hidden="true" /></button>
          </div>
        </div>

        {/* 스토리 영역 */}
        <div style={{ display: "flex", gap: 14, padding: "12px 14px", borderBottom: `0.5px solid ${BD}`, background: CA, overflowX: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${BD2}`, padding: 2.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-plus" style={{ fontSize: 18, color: T3 }} aria-hidden="true" /></div>
            </div>
            <span style={{ fontSize: 12, color: T2 }}>오늘</span>
          </div>
          {recentDates.map((item, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${i%2===0 ? CY : PK}`, padding: 2.5 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: i%2===0 ? CYL : PKL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: i%2===0 ? CY : PK }}>{item.day}</div>
              </div>
              <span style={{ fontSize: 12, color: T2 }}>{item.ds.slice(5)}</span>
            </div>
          ))}
          {recentDates.length === 0 && [0,1,2,3].map(i => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${BD}`, padding: 2.5 }}><div style={{ width: 44, height: 44, borderRadius: "50%", background: BG }} /></div>
              <span style={{ fontSize: 12, color: T4 }}>—</span>
            </div>
          ))}
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", borderBottom: `0.5px solid ${BD}`, background: CA, position: "sticky", top: 44, zIndex: 10 }}>
          {[["today","Today"],["dashboard","Dashboard"],["calendar","Calendar"],["history","History"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "9px 4px", background: "none", border: "none", borderBottom: tab===id ? `2px solid ${CY}` : "2px solid transparent", color: tab===id ? CY : T3, cursor: "pointer", fontSize: 13, fontWeight: tab===id ? 700 : 400, fontFamily: "'Courier New', monospace" }}>{label}</button>
          ))}
        </div>

        <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>

          {tab === "today" && <>
            {isBodyDay && !showBodyForm && (
              <div style={{ background: CYL, border: `0.5px solid ${CYB}`, borderRadius: 10, padding: "9px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                <i className="ti ti-scale" style={{ fontSize: 16, color: CY }} aria-hidden="true" />
                <span style={{ fontSize: 13, color: CY, flex: 1 }}>// 오늘은 신체 지표 측정일이에요 ({DAYS_SHORT[bodyDay]})</span>
                <button onClick={() => setShowBodyForm(true)} style={{ background: CYL, color: CY, border: `0.5px solid ${CYB}`, borderRadius: 16, padding: "3px 10px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>기록하기</button>
              </div>
            )}
            {showBodyForm && (
              <div style={{ ...card, border: `0.5px solid ${CYB}` }}>
                <CardHead iconBg={CYL} iconColor={CY} icon="ti-scale" title="신체 지표" badge={<span style={bcy}>주 1회</span>} />
                <div style={{ padding: "10px 12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[["weight","몸무게 (kg)"],["muscle","골격근 (kg)"],["fat","체지방 (kg)"],["fatRate","체지방률 (%)"]].map(([k, l]) => (
                    <div key={k}><div style={lbl}>{l}</div><input style={{ ...inp, borderRadius: 8 }} type="number" step="0.1" value={bodyInput[k]} onChange={e => setBodyInput({ ...bodyInput, [k]: e.target.value })} /></div>
                  ))}
                </div>
              </div>
            )}

            {/* Cardio */}
            <div style={card}>
              <CardHead iconBg={CYL} iconColor={CY} icon="ti-run" title="Cardio" sub={cardio.type ? `${cardio.type}${cardio.duration ? " · "+cardio.duration+"분" : ""}` : null} badge={cardio.type ? <span style={bcy}>완료</span> : null} />
              <div style={{ padding: "10px 12px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8 }}>
                {[["type","종류","러닝, 자전거..."],["duration","시간(분)","30"],["distance","거리(km)","선택"]].map(([k,l,ph]) => (
                  <div key={k}><div style={lbl}>{l}</div><input style={inp} type={k==="type"?"text":"number"} placeholder={ph} value={cardio[k]} onChange={e => setCardio({ ...cardio, [k]: e.target.value })} /></div>
                ))}
              </div>
            </div>

            {/* Weights */}
            <div style={card}>
              <CardHead iconBg={PKL} iconColor={PK} icon="ti-barbell" title="Weights" sub={exercises.filter(e=>e.name).map(e=>e.name).join(" · ")||null} badge={<span style={bpk}>{exercises.filter(e=>e.name).length} 종목</span>} />
              <div style={{ padding: "10px 12px" }}>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ ...comment, marginBottom: 7 }}>// 오늘 운동 부위</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {["가슴","등","어깨","팔","하체","복근","전신"].map(part => {
                      const active = workoutParts.includes(part);
                      return <button key={part} onClick={() => setWorkoutParts(active ? workoutParts.filter(p=>p!==part) : [...workoutParts, part])} style={{ padding: "4px 11px", borderRadius: 20, fontSize: 13, fontWeight: active ? 700 : 400, cursor: "pointer", fontFamily: "'Courier New', monospace", border: `0.5px solid ${active ? PK : BD2}`, background: active ? PKL : BG, color: active ? PK : T3 }}>{part}</button>;
                    })}
                  </div>
                </div>
                <div style={{ height: "0.5px", background: BD, marginBottom: 10 }} />
                {exercises.map((ex, ei) => (
                  <div key={ei} style={{ marginBottom: ei < exercises.length-1 ? 14 : 0 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 7 }}>
                      {ex.name && <div style={{ ...comment, margin: 0 }}>// {ex.name}</div>}
                      <input style={{ ...inp, flex: 1, borderRadius: 8 }} placeholder="종목 (예: 스쿼트)" value={ex.name} onChange={e => upExName(ei, e.target.value)} />
                      {exercises.length > 1 && <button onClick={() => setExercises(exercises.filter((_,i)=>i!==ei))} style={{ background: "none", border: "none", color: T4, cursor: "pointer", padding: 4 }}><i className="ti ti-trash" style={{ fontSize: 13 }} /></button>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr 64px", gap: 4, marginBottom: 4 }}>
                      <span />
                      <span style={{ fontSize: 12, color: T2, textAlign: "center" }}>무게 kg</span>
                      <span style={{ fontSize: 12, color: T2, textAlign: "center" }}>횟수</span>
                      <span style={{ fontSize: 12, color: AM, textAlign: "center", fontWeight: 600 }}>1RM</span>
                    </div>
                    {ex.sets.map((st, si) => {
                      const rm = epley(st.w, st.r);
                      return (
                        <div key={si} style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr 64px", gap: 4, marginBottom: 3 }}>
                          <span style={{ fontSize: 12, color: T3, display: "flex", alignItems: "center" }}>{si+1}</span>
                          <input style={inpFlat} type="number" placeholder="—" value={st.w} onChange={e => upSet(ei, si, "w", e.target.value)} />
                          <input style={inpFlat} type="number" placeholder="—" value={st.r} onChange={e => upSet(ei, si, "r", e.target.value)} />
                          <div style={{ height: 26, background: rm>0 ? AML : BG, border: `0.5px solid ${rm>0 ? AMB : BD}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: rm>0 ? AM : T4, fontWeight: rm>0 ? 700 : 400 }}>{rm > 0 ? `${rm}` : "—"}</div>
                        </div>
                      );
                    })}
                    {getVol(ex) > 0 && (
                      <div style={{ display: "flex", gap: 8, marginTop: 6, padding: "5px 10px", background: GRL, borderRadius: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: GR }}>총 볼륨</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: GR }}>{getVol(ex).toFixed(0)} kg</span>
                        <span style={{ marginLeft: "auto", fontSize: 12, color: T2 }}>최고 1RM</span>
                        <span style={{ background: AML, color: AM, border: `0.5px solid ${AMB}`, borderRadius: 8, fontSize: 12, padding: "1px 8px", fontWeight: 700 }}>{getMaxRM(ex)} kg</span>
                      </div>
                    )}
                    {ei < exercises.length-1 && <div style={{ height: "0.5px", background: BD, margin: "10px 0" }} />}
                  </div>
                ))}
                <div style={{ height: "0.5px", background: BD, margin: "10px 0" }} />
                <button onClick={() => setExercises([...exercises, emptyEx()])} style={{ width: "100%", padding: "6px 0", background: "none", border: `0.5px dashed ${BD2}`, borderRadius: 8, fontSize: 13, color: T3, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>+ 종목 추가</button>
              </div>
            </div>

            {/* Condition */}
            <div style={card}>
              <CardHead iconBg={PUL} iconColor={PU} icon="ti-mood-smile" title="Condition" />
              <div style={{ padding: "10px 12px" }}>
                <div style={comment}>// Sleep</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[["score","Sleep Score","85","pts"],["inBed","Time in Bed","7.5","hrs"],["actual","Actual Sleep","6.8","hrs"]].map(([k,l,ph,unit]) => (
                    <div key={k}>
                      <div style={lbl}>{l}</div>
                      <input style={{ ...inp, textAlign: "center", borderRadius: 8 }} type="number" step="0.1" placeholder={ph} value={sleep[k]} onChange={e => setSleep({ ...sleep, [k]: e.target.value })} />
                      <div style={{ fontSize: 12, color: T4, marginTop: 3, textAlign: "center" }}>{unit}</div>
                    </div>
                  ))}
                </div>
                <div style={{ height: "0.5px", background: BD, margin: "4px 0 10px" }} />
                <div style={comment}>// Energy Level</div>
                <div style={{ display: "flex", gap: 3, alignItems: "center", marginBottom: 12 }}>
                  {[1,2,3,4,5].map(n => <button key={n} onClick={() => setEnergy(energy===n ? 0 : n)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: n<=energy ? CY : BD, padding: "2px 1px", lineHeight: 1 }}>★</button>)}
                  <span style={{ fontSize: 13, color: T2, marginLeft: 5 }}>{energy}/5</span>
                </div>
                <div style={{ height: "0.5px", background: BD, margin: "4px 0 10px" }} />
                <div style={lbl}>One-liner</div>
                <input style={inp} placeholder="오늘 하루 한 줄로..." value={note} onChange={e => setNote(e.target.value)} />
              </div>
            </div>

            {/* Meal */}
            <div style={card}>
              <CardHead iconBg={GRL} iconColor={GR} icon="ti-salad" title="Meal Notes" />
              <div style={{ padding: "10px 12px" }}>
                {[["morning","아침"],["lunch","점심"],["dinner","저녁"],["snack","간식"]].map(([k,l]) => (
                  <div key={k} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 7 }}>
                    <span style={{ fontSize: 13, color: T2, width: 28, flexShrink: 0 }}>{l}</span>
                    <input style={inp} placeholder="메모..." value={diet[k]} onChange={e => setDiet({ ...diet, [k]: e.target.value })} />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={saveLog} disabled={coachLoading} style={{ background: coachLoading ? CYL : CYL, color: CY, border: `0.5px solid ${CYB}`, borderRadius: 22, padding: "11px 0", fontSize: 13, fontWeight: 700, cursor: coachLoading ? "default" : "pointer", width: "100%", fontFamily: "'Courier New', monospace" }}>
              {coachLoading ? "저장 중 · PT Coaching 생성 중..." : savedToday ? "기록 업데이트 & 재코칭 →" : "Save Today & Get AI Coaching →"}
            </button>

            {(coaching || coachLoading) && (
              <div style={{ background: GRL, border: `0.5px solid ${GRB}`, borderRadius: 10, padding: "10px 13px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}><i className="ti ti-sparkles" style={{ fontSize: 13, color: GR }} aria-hidden="true" /><span style={{ fontSize: 13, fontWeight: 700, color: GR }}>PT Coaching</span></div>
                {coachLoading ? <div style={{ fontSize: 13, color: GR }}>// 분석 중...</div> : <div style={{ fontSize: 13, color: T1, lineHeight: 1.9 }}>{coaching}</div>}
              </div>
            )}
          </>}

          {tab === "dashboard" && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Weight", val: lastBody ? `${lastBody.weight} kg` : "—", sub: wDelta ? (parseFloat(wDelta)<0 ? `▼ ${Math.abs(wDelta)} kg` : `▲ ${wDelta} kg`) : "기록 없음", sc: wDelta ? (parseFloat(wDelta)<0 ? GR : PK) : T4, bg: CYL, br: CYB },
                { label: "Squat 1RM", val: (() => { const r = getAllMax(); return r["스쿼트"] ? `${r["스쿼트"]} kg` : "—"; })(), sub: "개인 최고 기록", sc: AM, bg: AML, br: AMB },
                { label: "Body Fat %", val: lastBody?.fatRate ? `${lastBody.fatRate} %` : "—", sub: lastBody?.muscle ? `골격근 ${lastBody.muscle}kg` : "기록 없음", sc: GR, bg: GRL, br: GRB },
                { label: "This Week", val: `${thisWeek}회`, sub: `총 ${logs.length}회 누적`, sc: PU, bg: PUL, br: PUB },
              ].map((m, i) => (
                <div key={i} style={{ background: m.bg, borderRadius: 10, padding: "10px 12px", border: `0.5px solid ${m.br}` }}>
                  <div style={{ fontSize: 12, color: T2, marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: T1 }}>{m.val}</div>
                  <div style={{ fontSize: 12, color: m.sc, marginTop: 2, fontWeight: 600 }}>{m.sub}</div>
                </div>
              ))}
            </div>
            {bodyChartData.length > 1 ? (
              <div style={{ ...card, padding: 12 }}>
                <div style={{ fontSize: 13, color: T2, marginBottom: 10 }}>// Weight / Body Fat % Trend</div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={bodyChartData}><XAxis dataKey="date" tick={{ fontSize: 12, fill: T3 }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip content={<Tip />} /><Line type="monotone" dataKey="weight" stroke={CY} strokeWidth={2} dot={{ fill: CY, r: 3 }} name="Weight" /><Line type="monotone" dataKey="fat" stroke={PK} strokeWidth={2} dot={{ fill: PK, r: 3 }} name="Body Fat %" /></LineChart>
                </ResponsiveContainer>
              </div>
            ) : <div style={{ ...card, padding: "20px 0", textAlign: "center" }}><div style={{ fontSize: 13, color: T4 }}>// 신체 지표를 기록하면 그래프가 표시돼요</div></div>}
            {volChartData.length > 0 ? (
              <div style={{ ...card, padding: 12 }}>
                <div style={{ fontSize: 13, color: T2, marginBottom: 10 }}>// Volume Trend (kg)</div>
                <ResponsiveContainer width="100%" height={110}>
                  <BarChart data={volChartData}><XAxis dataKey="date" tick={{ fontSize: 12, fill: T3 }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip content={<Tip />} /><Bar dataKey="vol" fill={GR} radius={[3,3,0,0]} name="Volume" /></BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div style={{ ...card, padding: "20px 0", textAlign: "center" }}><div style={{ fontSize: 13, color: T4 }}>// 운동을 기록하면 Volume Trend가 표시돼요</div></div>}
            {Object.keys(getAllMax()).length > 0 && (
              <div style={card}>
                <div style={{ padding: "9px 12px", borderBottom: `0.5px solid ${BD}`, display: "flex", alignItems: "center", gap: 6 }}><i className="ti ti-trophy" style={{ fontSize: 13, color: AM }} aria-hidden="true" /><span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>// 개인 최고 1RM</span></div>
                <div style={{ padding: "10px 12px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(90px,1fr))", gap: 6 }}>
                  {Object.entries(getAllMax()).map(([name, rm]) => (
                    <div key={name} style={{ background: AML, borderRadius: 8, padding: "8px 10px", textAlign: "center", border: `0.5px solid ${AMB}` }}>
                      <div style={{ fontSize: 12, color: T2, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: AM }}>{rm}<span style={{ fontSize: 12, fontWeight: 400 }}> kg</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>}

          {tab === "calendar" && (
            <div style={card}>
              <div style={{ padding: "9px 12px", borderBottom: `0.5px solid ${BD}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>{MONTH_NAMES[month]} {year}</span>
                <span style={{ fontSize: 13, color: T2 }}>운동 {logs.filter(l=>l.date.startsWith(`${year}-${String(month+1).padStart(2,"0")}`)).length}일</span>
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 5 }}>
                  {DAYS_SHORT.map(d => <div key={d} style={{ textAlign: "center", fontSize: 9, color: T3 }}>{d}</div>)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
                  {Array(firstDay).fill(null).map((_,i) => <div key={"e"+i} />)}
                  {Array(daysInMonth).fill(null).map((_,i) => {
                    const d = i+1;
                    const ds = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                    const isT = ds === td; const hasL = logDates.has(ds);
                    return <div key={d} style={{ height: 30, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, background: isT ? CY : hasL ? CYL : BG, color: isT ? "#1e1e2e" : hasL ? CY : T3, fontWeight: isT||hasL ? 700 : 400, border: hasL&&!isT ? `0.5px solid ${CYB}` : "none", cursor: hasL ? "pointer" : "default" }} onClick={() => hasL && setTab("history")}>{d}</div>;
                  })}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 12, color: T3, alignItems: "center" }}>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, background: CY, borderRadius: 2, marginRight: 3, verticalAlign: -1 }} />Today</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, background: CYL, border: `0.5px solid ${CYB}`, borderRadius: 2, marginRight: 3, verticalAlign: -1 }} />Workout</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, background: BG, borderRadius: 2, marginRight: 3, verticalAlign: -1 }} />Rest</span>
                </div>
              </div>
            </div>
          )}

          {tab === "history" && <>
            {Object.keys(getAllMax()).length > 0 && (
              <div style={card}>
                <div style={{ padding: "9px 12px", borderBottom: `0.5px solid ${BD}`, display: "flex", alignItems: "center", gap: 6 }}><i className="ti ti-trophy" style={{ fontSize: 13, color: AM }} aria-hidden="true" /><span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>// 종목별 MAX 1RM</span></div>
                <div style={{ padding: "10px 12px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(90px,1fr))", gap: 6 }}>
                  {Object.entries(getAllMax()).map(([name, rm]) => (
                    <div key={name} style={{ background: AML, borderRadius: 8, padding: "8px 10px", textAlign: "center", border: `0.5px solid ${AMB}` }}>
                      <div style={{ fontSize: 12, color: T2, marginBottom: 3 }}>{name}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: AM }}>{rm}<span style={{ fontSize: 10 }}> kg</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ fontSize: 13, color: T4, padding: "2px 2px" }}>// 최근 기록 (최신순)</div>
            {logs.length === 0 && <div style={{ ...card, textAlign: "center", padding: 28, color: T4, fontSize: 12 }}>// 아직 기록이 없어요. 오늘 첫 기록을 남겨보세요!</div>}
            {[...logs].reverse().slice(0, 20).map((log, i) => (
              <div key={i} style={{ ...card, cursor: "pointer" }} onClick={() => setExpandLog(expandLog===i ? null : i)}>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: CY }}>{log.date}</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {log.energy > 0 && <span style={{ fontSize: 12, color: CY }}>{"★".repeat(log.energy)}</span>}
                      <span style={{ fontSize: 13, color: T4 }}>{expandLog===i ? "▲" : "▼"}</span>
                    </div>
                  </div>
                  {(log.cardio?.type || (log.exercises||[]).some(e=>e.name)) && (
                    <div style={{ fontSize: 13, color: T2, marginTop: 4 }}>
                      {log.cardio?.type && <span style={{ marginRight: 10, color: CY }}>▶ {log.cardio.type}{log.cardio.duration ? " "+log.cardio.duration+"분" : ""}</span>}
                      {(log.exercises||[]).filter(e=>e.name).map((e,j) => <span key={j} style={{ marginRight: 8, color: PK }}>▶ {e.name}</span>)}
                    </div>
                  )}
                  {log.workoutParts?.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5 }}>
                      {log.workoutParts.map(p => <span key={p} style={{ background: PKL, color: PK, border: `0.5px solid ${PKB}`, borderRadius: 10, fontSize: 12, padding: "1px 7px", fontWeight: 600 }}>{p}</span>)}
                    </div>
                  )}
                </div>
                {expandLog === i && (
                  <div style={{ borderTop: `0.5px solid ${BD}`, padding: "10px 12px" }}>
                    {(log.exercises||[]).filter(e=>e.name).map((e,j) => (
                      <div key={j} style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 13, color: PK, marginBottom: 4 }}>// {e.name} — 볼륨 {getVol(e).toFixed(0)}kg / 1RM {getMaxRM(e)}kg</div>
                        {e.sets.filter(s=>s.w&&s.r).map((s,k) => <div key={k} style={{ fontSize: 12, color: T2, marginLeft: 8, marginBottom: 2 }}>{k+1}set: {s.w}kg × {s.r}회 → <span style={{ color: AM }}>{epley(s.w,s.r)}kg</span></div>)}
                      </div>
                    ))}
                    {log.note && <div style={{ fontSize: 13, color: T3, marginTop: 6 }}>// "{log.note}"</div>}
                    {log.coaching && (
                      <div style={{ background: GRL, border: `0.5px solid ${GRB}`, borderRadius: 8, padding: "8px 10px", marginTop: 8 }}>
                        <div style={{ fontSize: 12, color: GR, marginBottom: 4, fontWeight: 600 }}>// PT Coaching</div>
                        <div style={{ fontSize: 13, color: T1, lineHeight: 1.8 }}>{log.coaching}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </>}

        </div>

        {/* 하단 탭바 */}
        <div style={{ display: "flex", borderTop: `0.5px solid ${BD}`, background: CA, position: "sticky", bottom: 0 }}>
          {[["today","ti-home"],["dashboard","ti-chart-bar"],["calendar","ti-calendar"],["history","ti-history"]].map(([id, icon]) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "9px 4px 7px", background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", outline: "none", WebkitTapHighlightColor: "transparent" }}>
              <i className={`ti ${icon}`} style={{ fontSize: 19, color: tab===id ? CY : T4 }} aria-hidden="true" />
              {tab===id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: CY }} />}
            </button>
          ))}
        </div>

        {/* 상태바 */}
        <div style={{ background: CY, padding: "3px 12px", display: "flex", gap: 14, fontSize: 13, color: "#1e1e2e", fontWeight: 600 }}>
          <span>⎇ main</span>
          <span>✓ {logs.filter(l=>l.date===td).length > 0 ? "저장됨" : "미저장"}</span>
          <span style={{ marginLeft: "auto" }}>UTF-8 · LF · JS</span>
        </div>

      </div>
    </div>
  );
}
