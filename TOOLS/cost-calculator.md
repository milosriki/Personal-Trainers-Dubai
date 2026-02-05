---
layout: page
title: Dubai Personal Training Cost Calculator
permalink: /tools/cost-calculator/
---

# 💰 Is Your Gym Membership Wasted Money?

**Calculate the true cost of fitness in Dubai.**

<div id="calculator-container" style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; background-color: #f9f9f9;">
  <label for="gym-cost">Monthly Gym Membership (AED):</label>
  <input type="number" id="gym-cost" placeholder="e.g. 500" value="500" style="width: 100%; padding: 8px; margin-bottom: 10px;">

<label for="gym-visits">Actual Visits Per Month:</label>
<input type="number" id="gym-visits" placeholder="e.g. 4" value="4" style="width: 100%; padding: 8px; margin-bottom: 10px;">

<label for="commute-time">Commute Time per Visit (mins):</label>
<input type="number" id="commute-time" placeholder="e.g. 30" value="30" style="width: 100%; padding: 8px; margin-bottom: 10px;">

<label for="your-hourly-rate">Your Hourly Earnings (AED) (Optional):</label>
<input type="number" id="your-hourly-rate" placeholder="e.g. 200" value="200" style="width: 100%; padding: 8px; margin-bottom: 20px;">

<button onclick="calculateCost()" style="background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Calculate True Cost</button>

  <div id="result" style="margin-top: 20px; font-weight: bold; display: none;">
    <h3>⚠️ The Ugly Truth:</h3>
    <p>Cost per actual workout: <span id="cost-per-workout" style="color: #d9534f;"></span> AED</p>
    <p>Time wasted commuting monthly: <span id="time-wasted" style="color: #d9534f;"></span> hours</p>
    <p>Value of wasted time: <span id="wasted-value" style="color: #d9534f;"></span> AED</p>
    <hr>
    <p style="font-size: 1.2em;">🔥 <strong>PTD Fitness Effect:</strong></p>
    <p>We come to you. <strong>0 minutes wasted.</strong></p>
    <p>100% of your time is training.</p>
    <a href="https://wa.me/971506217146" style="display: block; text-align: center; background-color: #28a745; color: white; padding: 10px; text-decoration: none; border-radius: 4px; margin-top: 10px;">👉 Book a Time-Efficient Trainer</a>
  </div>
</div>

<script>
function calculateCost() {
  const gymCost = parseFloat(document.getElementById('gym-cost').value) || 0;
  const visits = parseFloat(document.getElementById('gym-visits').value) || 1;
  const commute = parseFloat(document.getElementById('commute-time').value) || 0;
  const hourlyRate = parseFloat(document.getElementById('your-hourly-rate').value) || 0;

  const costPerVisit = (gymCost / visits).toFixed(2);
  const totalCommuteMins = visits * commute;
  const totalCommuteHours = (totalCommuteMins / 60).toFixed(1);
  const wastedValue = (totalCommuteHours * hourlyRate).toFixed(2);

  document.getElementById('cost-per-workout').innerText = costPerVisit;
  document.getElementById('time-wasted').innerText = totalCommuteHours;
  document.getElementById('wasted-value').innerText = wastedValue;

  document.getElementById('result').style.display = 'block';
}
</script>

---

### Why use this calculator?

Most people look at the "monthly fee" (e.g. 400 AED) but forget the "usage fee". If you only go 4 times a month, you are paying **100 AED per entry** to rent equipment you don't know how to use.

**Add the cost of your time.** Driving 30 mins to Gymnation or Fitness First means 4 hours a month lost in traffic.

**The Solution:**
PTD Fitness trainers come to your building. You save the drive. You never miss a session because we are at your door.

[**Stop Wasting Time. Start Training.**](https://wa.me/971506217146)
