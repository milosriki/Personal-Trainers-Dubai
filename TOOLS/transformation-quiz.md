---
layout: page
title: What's Your Dubai Fitness Personality?
permalink: /tools/transformation-quiz/
---

# 🧬 What Type of "Dubai Athlete" Are You?

**Take the 30-second quiz to find your perfect training style.**

<div id="quiz-container" style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; background-color: #fff;">
  
  <div id="q1" class="question">
    <h3>1. What is your typical lunch?</h3>
    <button onclick="answer(1, 'executive')" style="display:block; width:100%; margin:5px 0; padding:10px;">Deliveroo / Meal Prep at Desk</button>
    <button onclick="answer(1, 'social')" style="display:block; width:100%; margin:5px 0; padding:10px;">Business Lunch / Acai Bowl</button>
    <button onclick="answer(1, 'warrior')" style="display:block; width:100%; margin:5px 0; padding:10px;">Protein Shake / Chicken & Rice</button>
  </div>

  <div id="q2" class="question" style="display:none;">
    <h3>2. Your ideal workout time?</h3>
    <button onclick="answer(2, 'executive')" style="display:block; width:100%; margin:5px 0; padding:10px;">6:00 AM (Before chaotic day starts)</button>
    <button onclick="answer(2, 'social')" style="display:block; width:100%; margin:5px 0; padding:10px;">Evening group class</button>
    <button onclick="answer(2, 'warrior')" style="display:block; width:100%; margin:5px 0; padding:10px;">Whenever I can lift heavy things</button>
  </div>

  <div id="q3" class="question" style="display:none;">
    <h3>3. Biggest fitness obstacle?</h3>
    <button onclick="answer(3, 'executive')" style="display:block; width:100%; margin:5px 0; padding:10px;">Zero time / Travel schedule</button>
    <button onclick="answer(3, 'social')" style="display:block; width:100%; margin:5px 0; padding:10px;">Getting bored / Motivation</button>
    <button onclick="answer(3, 'warrior')" style="display:block; width:100%; margin:5px 0; padding:10px;">Injuries / Stalled progress</button>
  </div>

  <div id="result" style="display:none; text-align:center; padding: 20px; background: #e9ecef; margin-top: 20px;">
    <h2 id="result-title"></h2>
    <p id="result-desc"></p>
    <a href="https://wa.me/971506217146" class="cta-button" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">Get My Custom Plan</a>
  </div>

</div>

<script>
let scores = { executive: 0, social: 0, warrior: 0 };

function answer(qNum, type) {
  scores[type]++;
  document.getElementById('q' + qNum).style.display = 'none';
  if (qNum < 3) {
    document.getElementById('q' + (qNum + 1)).style.display = 'block';
  } else {
    showResult();
  }
}

function showResult() {
  let type = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  let title = "";
  let desc = "";

  if (type === 'executive') {
    title = "🏎️ The Executive Sprinter";
    desc = "You are busy, high-value, and short on time. You don't need a gym; you need efficiency. Our **6 AM Home Sessions** are your secret weapon.";
  } else if (type === 'social') {
    title = "🌟 The Lifestyle Athlete";
    desc = "You want fitness to be fun, not a chore. You thrive on energy. Our **Boxing** or **Couples Training** packages are perfect for keeping you engaged.";
  } else {
    title = "🛡️ The Weekend Warrior";
    desc = "You have the drive but need the structure. You want real results. Our **12-Week Transformation** is the disciplined approach you've been looking for.";
  }

  document.getElementById('result-title').innerText = title;
  document.getElementById('result-desc').innerText = desc;
  document.getElementById('result').style.display = 'block';
}
</script>

---

### Challenge Your Friends

Share your result! Are you an **Executive Sprinter** or a **Weekend Warrior**?

[**WhatsApp Your Result**](https://wa.me/?text=I%20just%20took%20the%20Dubai%20Fitness%20Quiz!%20Find%20out%20your%20type%20here:%20https://milosriki.github.io/Personal-Trainers-Dubai/tools/transformation-quiz/)
