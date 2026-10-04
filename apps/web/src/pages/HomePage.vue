<template>
  <div class="home-page">
    <header class="topbar">
      <RouterLink to="/" aria-label="404: LAST REQUEST home">
        <BrandMark />
      </RouterLink>
      <span class="status-pill success"><span class="online-dot"></span> SANDBOX READY</span>
    </header>

    <main class="hero">
      <div class="hero-copy">
        <p class="label-mono eyebrow"><span class="online-dot"></span> INCIDENT RESPONSE // BUILD 1.0.0</p>
        <h1>Production is<br><span>waiting on you.</span></h1>
        <p class="intro">
          A broken application. A trail of clues. One last request before launch.
          Open the dev station, trace each failure, and ship the fix.
        </p>
        <div class="hero-actions">
          <RouterLink to="/cases" class="btn btn-primary">Open mission docket <span aria-hidden="true">→</span></RouterLink>
          <span class="label-mono">INCIDENT ARCHIVE // PRE-DEPLOY</span>
        </div>
      </div>

      <section class="incident-card panel" aria-label="Live incident preview">
        <div class="incident-top">
          <span class="label-mono">LIVE INCIDENT</span>
          <span class="status-pill danger">P1 // AUTH FAILURE</span>
        </div>
        <div class="terminal">
          <p><span class="muted">14:28:10</span> <span class="cyan">GET</span> /api/v1/auth/session</p>
          <p><span class="muted">14:28:10</span> <span class="red">401</span> Missing required field: <span class="amber">email</span></p>
          <p><span class="muted">14:28:11</span> <span class="red">ERR</span> Cannot read properties of undefined</p>
          <p class="terminal-prompt"><span class="green">➜</span> _</p>
        </div>
        <div class="incident-footer">
          <span><span class="online-dot"></span> STAGING ENVIRONMENT</span>
          <span>PORT 9229</span>
        </div>
      </section>

      <div class="hero-foot">
        <span class="label-mono">OBSERVE</span><span class="connector"></span>
        <span class="label-mono">INVESTIGATE</span><span class="connector"></span>
        <span class="label-mono">DEPLOY</span>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BrandMark from '@/components/BrandMark.vue'
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 75% 42%, rgba(0, 240, 255, 0.08), transparent 37%),
    linear-gradient(rgba(34, 45, 61, 0.18) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 45, 61, 0.18) 1px, transparent 1px),
    var(--color-canvas-root);
  background-size: auto, 32px 32px, 32px 32px, auto;
}

.topbar {
  height: 72px;
  padding: 0 clamp(1.25rem, 5vw, 5rem);
  border-bottom: 1px solid var(--color-hairline-stroke);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.topbar a { text-decoration: none; }
.topbar .brand-mark { width: 200px; }
.status-pill { gap: 7px; }
.online-dot { width: 7px; height: 7px; display: inline-block; border-radius: 50%; background: var(--color-secondary); box-shadow: 0 0 10px var(--color-secondary-glow); }

.hero {
  width: min(1120px, calc(100% - 3rem));
  min-height: calc(100vh - 72px);
  margin: 0 auto;
  padding: clamp(3rem, 10vh, 7.5rem) 0 2rem;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-content: center;
  align-items: center;
  gap: clamp(2rem, 7vw, 6rem);
  position: relative;
  z-index: 1;
}

.hero-copy { max-width: 590px; }
.eyebrow { color: var(--color-secondary); display: flex; align-items: center; gap: 9px; margin-bottom: 1.4rem; }
h1 { font: 700 clamp(3rem, 6vw, 5.4rem)/0.99 var(--font-display); letter-spacing: -0.06em; color: var(--color-text-primary); }
h1 span { color: var(--color-primary); }
.intro { max-width: 510px; margin-top: 1.5rem; color: var(--color-text-muted); font-size: 1.05rem; line-height: 1.8; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; margin-top: 2rem; }
.hero-actions .btn { min-height: 42px; padding-inline: 1.1rem; }
.hero-actions .label-mono { color: var(--color-text-ghost); font-size: 9px; }

.incident-card { padding: 1rem; box-shadow: 0 20px 80px rgba(0, 0, 0, 0.35); transform: rotate(1deg); }
.incident-top, .incident-footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.incident-top { margin-bottom: 1rem; }
.terminal { padding: 1.2rem; min-height: 175px; background: #05070a; border: 1px solid var(--color-hairline-stroke); border-radius: var(--radius-sm); font: 11px/2 var(--font-mono); overflow: hidden; }
.terminal p { white-space: nowrap; }
.muted { color: var(--color-text-ghost); }
.cyan { color: var(--color-primary); }
.red { color: var(--color-tertiary); }
.amber { color: var(--color-amber); }
.green { color: var(--color-secondary); }
.terminal-prompt { margin-top: .4rem; }
.incident-footer { padding: .8rem .1rem 0; font: 9px var(--font-mono); color: var(--color-text-muted); }
.incident-footer span:first-child { display: flex; gap: 7px; align-items: center; }
.hero-foot { grid-column: 1 / -1; display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: clamp(2rem, 8vh, 6rem); color: var(--color-text-ghost); }
.connector { width: clamp(30px, 12vw, 150px); height: 1px; background: var(--color-hairline-stroke); }

@media (max-width: 760px) {
  .hero { grid-template-columns: 1fr; align-content: start; padding-top: 4rem; gap: 2.5rem; }
  .incident-card { transform: none; }
  .hero-foot { margin-top: .5rem; }
}
</style>
