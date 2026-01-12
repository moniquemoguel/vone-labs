const EXIT_URL = "https://REPLACE-WITH-YOUR-VONE-MODULE-1-URL";

const content = {
  prompts: {
    weak: `Write a response to a hotel guest who is mad their room isn’t ready.`,
    better: `You are a hotel guest relations agent in Belize. Write a polite professional response to a guest who arrived at 2pm but their room wasn’t ready for over an hour. Apologize, take accountability, and provide next steps. Keep it warm and respectful.`,
    best: `Act as a Guest Relations Coordinator at a Belize resort.
Write a calm, professional, and human response to the guest complaint below.

Requirements:
- Start with empathy and a sincere apology
- Take responsibility without blaming staff
- Explain the situation briefly without making excuses
- Provide a clear solution with time expectations
- Offer a small service recovery gesture (example: complimentary drink / late checkout) without overpromising
- Maintain a warm Belize hospitality tone
- Keep it under 160 words

Guest message:
“I’m honestly disappointed. We arrived at 2pm like we were told, but the room still wasn’t ready. We’ve been waiting over an hour and no one has explained anything. This is wasting our vacation time.”

Output format:
Subject line + message body`
  },
  outputs: {
    weak: `Subject: Sorry about your room
Message:
Hi, sorry the room wasn’t ready. Sometimes delays happen. We are working on it and it should be ready soon. Please be patient. Thanks.`,
    better: `Subject: Apologies for the delay with your room
Message:
Hello, thank you for reaching out and I’m very sorry for the delay with your room being ready. I understand how frustrating it is to arrive at the scheduled time and still have to wait, especially when you’re looking forward to enjoying your vacation.
We are currently finalizing preparations and I will personally check with housekeeping to confirm the updated readiness time. Thank you for your patience and we truly appreciate your understanding.`,
    best: `Subject: Our apologies — we’re preparing your room now
Message:
Hello, and thank you for bringing this to our attention. I’m truly sorry for the delay and for the lack of clear communication after your arrival — your time is valuable, and this is not the welcome you deserved.

Your room is being prioritized right now, and I will update you within the next 15 minutes with an exact readiness time. In the meantime, we’d like to invite you to enjoy a complimentary drink while you wait.

Thank you again for your patience. We’re committed to making the rest of your stay smooth, relaxing, and worthy of your vacation.

Warm regards,
Guest Relations Team`
  },
  feedback: {
    weak: {
      title: "Not professional-ready.",
      bullets: [
        "Too short and dismissive (“please be patient” can increase frustration).",
        "No ownership or accountability.",
        "No clear next steps or time expectation.",
        "Sounds scripted and cold — not hospitality."
      ],
      moduleConnection:
        "Module 1 reminder: AI can produce something that looks like an answer but hurts your credibility. Professionals verify and refine."
    },
    better: {
      title: "Good start — needs refinement.",
      bullets: [
        "Apology and professionalism are stronger.",
        "Acknowledges frustration.",
        "Still missing: a clear time expectation.",
        "Still missing: a realistic service recovery gesture.",
        "Tone is generic — could be from any hotel."
      ],
      moduleConnection:
        "Module 1 reminder: Don’t stop at the first output. Better prompting + constraints = stronger results."
    },
    best: {
      title: "Professional-ready (VONE Standard).",
      bullets: [
        "Empathy and accountability are clear.",
        "Includes a time expectation (trust builder).",
        "Offers a realistic gesture without overpromising.",
        "Warm, human tone that protects reputation."
      ],
      moduleConnection:
        "Module 1 reminder: This is AI used correctly — guided by structure, tone, constraints, and professional standards."
    }
  },
  rubric: [
    { key: "tone", label: "Tone & Respect" },
    { key: "clarity", label: "Clarity & Readability" },
    { key: "accountability", label: "Accountability" },
    { key: "actions", label: "Action Steps + Time Expectation" },
    { key: "trust", label: "Trust & Professionalism" }
  ]
};

const state = { confidence: null, selectedLevel: null };

function $(id){ return document.getElementById(id); }

function show(screenId){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(screenId).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function exitToVone(){ window.location.href = EXIT_URL; }

function levelName(level){
  if(level === "weak") return "Weak (Beginner mistake)";
  if(level === "better") return "Better (Improving)";
  return "Best (VONE Standard)";
}

function scoreMeaning(score){
  if(score >= 20) return "✅ Professional Ready";
  if(score >= 14) return "⚠️ Needs Refinement";
  return "❌ Not acceptable for work/school";
}

function renderPrompts(){
  $("promptWeak").textContent = content.prompts.weak;
  $("promptBetter").textContent = content.prompts.better;
  $("promptBest").textContent = content.prompts.best;
}

function renderRubric(){
  const wrap = $("rubric");
  wrap.innerHTML = "";
  content.rubric.forEach((r) => {
    const row = document.createElement("div");
    row.className = "rubricRow";
    row.innerHTML = `
      <div class="rubricLabel">${r.label}</div>
      <div>
        <select id="rubric_${r.key}">
          <option value="0">Select</option>
          <option value="1">1 (Poor)</option>
          <option value="2">2</option>
          <option value="3">3 (OK)</option>
          <option value="4">4</option>
          <option value="5">5 (Excellent)</option>
        </select>
      </div>
    `;
    wrap.appendChild(row);
  });
}

function clearRubric(){
  content.rubric.forEach(r => {
    const el = $(`rubric_${r.key}`);
    if(el) el.value = "0";
  });
  $("scoreNum").textContent = "—";
  $("scoreMeaning").textContent = "Select scores and calculate.";
}

function selectLevel(level){
  state.selectedLevel = level;

  $("levelLabel").textContent = `Prompt level: ${levelName(level)}`;
  $("chosenPrompt").textContent = content.prompts[level];
  $("generatedOutput").textContent = content.outputs[level];

  const fb = content.feedback[level];
  $("coachFeedback").innerHTML = `
    <div><strong>${fb.title}</strong></div>
    <ul>${fb.bullets.map(b => `<li>${b}</li>`).join("")}</ul>
  `;
  $("moduleConnection").innerHTML = `<strong>Module 1 connection:</strong> ${fb.moduleConnection}`;

  clearRubric();
  show("screenOutput");
}

function calculateScore(){
  let total = 0;
  let missing = false;

  content.rubric.forEach(r => {
    const val = Number($(`rubric_${r.key}`).value || 0);
    if(val === 0) missing = true;
    total += val;
  });

  if(missing){
    $("scoreMeaning").textContent = "Choose a score for each rubric item to calculate.";
    return;
  }

  $("scoreNum").textContent = String(total);
  $("scoreMeaning").textContent = scoreMeaning(total);

  if(total >= 20){
    setTimeout(() => show("screenEnd"), 650);
  }
}

function resetLab(){
  state.selectedLevel = null;
  $("pauseTry").value = "";
  clearRubric();
  show("screenHome");
}

function init(){
  renderPrompts();
  renderRubric();

  $("btnStart").addEventListener("click", () => show("screenScenario"));
  $("btnHow").addEventListener("click", () => show("screenHow"));

  $("btnBeginScenario").addEventListener("click", () => show("screenScenario"));
  $("btnBackHome").addEventListener("click", () => show("screenHome"));

  $("btnChoosePrompt").addEventListener("click", () => show("screenPrompt"));
  $("btnBackHow").addEventListener("click", () => show("screenHow"));

  $("btnBackScenario").addEventListener("click", () => show("screenScenario"));

  $("btnExitTop").addEventListener("click", exitToVone);
  $("btnRestartTop").addEventListener("click", resetLab);

  $("btnExitPrompt").addEventListener("click", exitToVone);

  $("btnTryAnother").addEventListener("click", () => show("screenPrompt"));

  $("btnScore").addEventListener("click", calculateScore);
  $("btnRestart").addEventListener("click", resetLab);
  $("btnExit").addEventListener("click", exitToVone);

  $("btnEndExit").addEventListener("click", exitToVone);
  $("btnEndRestart").addEventListener("click", resetLab);

  document.querySelectorAll(".promptCard").forEach(card => {
    card.addEventListener("click", () => {
      const level = card.getAttribute("data-level");
      if(level) selectLevel(level);
    });
  });

  const confStatus = document.querySelector("#confidenceStatus span");
  document.querySelectorAll("#confidenceChips .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      state.confidence = chip.getAttribute("data-value");
      confStatus.textContent =
        state.confidence === "1" ? "I feel unsure" :
        state.confidence === "2" ? "I’m okay" :
        "I feel confident";
      document.querySelectorAll("#confidenceChips .chip").forEach(c => c.style.outline = "none");
      chip.style.outline = "2px solid rgba(46,160,67,.6)";
    });
  });
}

init();
