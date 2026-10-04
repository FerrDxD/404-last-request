<template>
  <div class="docket-page">
    <aside class="side-rail">
      <RouterLink to="/" class="rail-brand" aria-label="Go to home"><BrandMark /></RouterLink>
      <p class="label-mono rail-label">EXPLORER // NODES</p>
      <RouterLink to="/cases" class="rail-link active">▣ <span>Mission docket</span></RouterLink>
      <RouterLink to="/cases#audit-log" class="rail-link">◉ <span>Incident logs</span></RouterLink>
      <RouterLink to="/cases#case-brief" class="rail-link">⌘ <span>Case brief & SLA</span></RouterLink>
      <div class="rail-spacer"></div>
      <div class="sandbox-status"><span class="online-dot"></span> SANDBOX CONNECTED</div>
      <span class="label-mono rail-port">PORT 9229</span>
    </aside>

    <main class="docket-main">
      <header class="page-heading">
        <div>
          <p class="label-mono eyebrow">SEC-OPS ARCHIVE // KERNEL-08 <span class="online-dot"></span> LIVE INCIDENT ROOM</p>
          <h1>Mission docket <span>//</span> audit log</h1>
          <p class="subheading">Production bugs are waiting. Investigate each incident and ship a verified fix.</p>
        </div>
        <div class="summary-stats panel">
          <div><span class="label-mono">INCIDENTS CLEARED</span><strong>{{ completedCount }}<small> / {{ cases.length }}</small></strong></div>
          <div><span class="label-mono">DEPLOYMENT</span><strong>{{ progressPercent }}<small>%</small></strong></div>
        </div>
      </header>

      <section class="progress-panel panel">
        <div class="progress-heading">
          <span class="label-mono">CAMPAIGN DEPLOYMENT COMPLETION: {{ progressPercent }}%</span>
          <span class="label-mono" :class="completedCount ? 'ready' : 'waiting'">
            {{ completedCount ? `STAGE ${completedCount} CLEARED // NEXT TARGET AVAILABLE` : 'STAGE 01 // FIRST TARGET AVAILABLE' }}
          </span>
        </div>
        <div class="progress-track"><span :style="{ width: `${progressPercent}%` }"></span></div>
      </section>
      <p v-if="progressStore.persistenceError" class="persistence-warning" role="alert">
        {{ progressStore.persistenceError }}
      </p>

      <section class="docket-layout">
        <div class="case-column">
          <div class="section-heading">
            <h2>▧ Incidents dossier <span>// production bugs</span></h2>
            <span class="label-mono">SORT: PRIORITY ORDER · {{ cases.length }} CASES</span>
          </div>

          <div v-if="loading" class="state-panel panel">Connecting to incident archive…</div>
          <div v-else-if="error" class="state-panel panel error" role="alert">{{ error }}</div>
          <div v-else-if="cases.length === 0" class="state-panel panel">No incidents are available yet.</div>
          <div v-else id="case-brief" class="cases-grid">
            <article
              v-for="caseItem in cases"
              :key="caseItem.id"
              class="case-card panel"
              :class="{ locked: isLocked(caseItem), cleared: isCompleted(caseItem) }"
            >
              <div class="case-card-top">
                <span class="status-pill" :class="isCompleted(caseItem) ? 'success' : isLocked(caseItem) ? 'warning' : 'danger'">
                  CASE {{ caseItem.order.toString().padStart(2, '0') }}
                </span>
                <span class="case-state" :class="isCompleted(caseItem) ? 'done' : isLocked(caseItem) ? '' : 'active'">
                  {{ isCompleted(caseItem) ? '✓ RESOLVED' : isLocked(caseItem) ? '⌑ ENCRYPTED' : '● READY TO TRIAGE' }}
                </span>
                <span class="difficulty" :aria-label="`Difficulty ${caseItem.difficulty} of 5`">
                  <span v-for="star in 5" :key="star" :class="{ lit: star <= caseItem.difficulty }">★</span>
                </span>
              </div>

              <h3>{{ caseItem.title }}</h3>
              <p class="case-description">{{ caseItem.description }}</p>

              <div v-if="isCompleted(caseItem)" class="case-meta">
                <span>BEST SCORE <b>{{ progressStore.getBestScore(caseItem.id) ?? 0 }} PTS</b></span>
                <span>LAST RUN <b>{{ progressStore.attemptCounts[caseItem.id] || 0 }} ATTEMPTS · {{ progressStore.hintUsage[caseItem.id] || 0 }} HINTS</b></span>
              </div>
              <div v-else-if="isLocked(caseItem)" class="case-meta locked-meta">
                <span>LOCK REQUIREMENT</span><b>RESOLVE THE PREVIOUS CASE</b>
              </div>
              <div v-else class="case-meta">
                <span>DIFFICULTY <b>{{ caseItem.difficulty }} / 5</b></span><span>ENV <b>STAGING</b></span>
              </div>

              <RouterLink v-if="!isLocked(caseItem)" :to="`/play/${caseItem.slug}`" class="btn case-action" :class="isCompleted(caseItem) ? 'btn-secondary' : 'btn-primary'">
                {{ isCompleted(caseItem) ? '↻ Review / replay case' : '↗ Commence triage' }}
              </RouterLink>
              <button v-else class="btn case-action" disabled>🔒 Locked</button>
            </article>
          </div>

          <section id="audit-log" class="audit-log panel">
            <div class="audit-heading"><span class="label-mono">▧ SYSTEM AUDIT LOG // REALTIME RECORD</span><span class="label-mono">LOCAL PROGRESS</span></div>
            <template v-if="completedCases.length">
              <div v-for="id in completedCases" :key="id" class="audit-row">
                <span class="online-dot"></span><b>[PATCH_ACCEPTED]</b> Incident {{ id }} resolved and saved to this device.
              </div>
            </template>
            <div v-else class="audit-row muted">No patches deployed yet. Your cleared incidents will appear here.</div>
          </section>
        </div>

        <aside class="intel-column">
          <section class="operator-card panel">
            <div class="operator-avatar">DEV</div>
            <div><span class="label-mono">OPERATOR // LOCAL PROFILE</span><h2>Incident responder</h2><p>Debugging the final release</p></div>
            <span class="operator-level">LVL {{ Math.max(1, completedCount + 1) }}</span>
            <div class="operator-score"><span>CAMPAIGN</span><b>{{ completedCount ? 'IN PROGRESS' : 'NOT STARTED' }}</b></div>
            <div class="operator-score"><span>INCIDENTS</span><b>{{ completedCount }} / {{ cases.length }}</b></div>
          </section>
          <section class="intel-card panel">
            <div class="intel-heading"><span class="online-dot"></span><h2>PM comms stream</h2><span class="label-mono">#WAR-ROOM</span></div>
            <blockquote>“The staging build is still unstable. Check the evidence, follow the request trail, and verify your patch before deployment.”</blockquote>
            <div class="intel-footer"><span>MISSION CONTROL</span><span>JUST NOW</span></div>
          </section>
          <section class="intel-card telemetry panel">
            <div class="intel-heading"><h2>⌁ Runtime telemetry</h2><span class="status-pill" :class="error ? 'danger' : loading ? 'warning' : 'success'">{{ error ? 'ARCHIVE OFFLINE' : loading ? 'CONNECTING' : 'HEALTHY' }}</span></div>
            <div class="telemetry-bars"><span v-for="bar in telemetryBars" :key="bar" :style="{ height: `${bar}px` }"></span></div>
            <div class="telemetry-row"><span>Persistence state</span><b>{{ progressStore.persistenceError ? 'SAVE NEEDS ATTENTION' : 'LOCAL SAVE ACTIVE' }}</b></div>
            <div class="telemetry-row"><span>Sandbox node</span><b>PORT 9229</b></div>
            <button class="settings-button" @click="toggleReducedMotion">
              REDUCED MOTION <b>{{ progressStore.settings.reducedMotion ? 'ON' : 'OFF' }}</b>
            </button>
            <button class="settings-button reset-button" @click="resetCampaign">
              {{ resetArmed ? 'CONFIRM RESET CAMPAIGN' : 'RESET LOCAL PROGRESS' }}
            </button>
          </section>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { CaseMetadata } from '@404-last-request/shared'
import { useProgressStore } from '@/stores/progress.store'
import BrandMark from '@/components/BrandMark.vue'
import { fetchCases } from '@/services/api'

const progressStore = useProgressStore()
const loading = ref(true)
const error = ref<string | null>(null)
const cases = ref<CaseMetadata[]>([])
const resetArmed = ref(false)
const completedCases = computed(() => progressStore.completedCases)
const completedCount = computed(() => cases.value.filter(isCompleted).length)
const progressPercent = computed(() => cases.value.length ? Math.round((completedCount.value / cases.value.length) * 100) : 0)
const telemetryBars = Array.from({ length: 12 }, (_, index) => 18 + ((index * 17 + 11) % 34))

onMounted(async () => {
  progressStore.loadProgress()
  try {
    cases.value = await fetchCases()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'An unexpected error occurred while loading cases.'
  } finally {
    loading.value = false
  }
})

function isCompleted(caseItem: CaseMetadata): boolean {
  return progressStore.isCaseCompleted(caseItem.id)
}

function isLocked(caseItem: CaseMetadata): boolean {
  if (caseItem.order <= 1) return false
  const previousCase = cases.value.find(item => item.order === caseItem.order - 1)
  return !previousCase || !isCompleted(previousCase)
}

function toggleReducedMotion() {
  progressStore.updateSettings({ reducedMotion: !progressStore.settings.reducedMotion })
}

function resetCampaign() {
  if (!resetArmed.value) {
    resetArmed.value = true
    window.setTimeout(() => { resetArmed.value = false }, 5000)
    return
  }

  resetArmed.value = false
  progressStore.resetProgress()
}
</script>

<style scoped>
.docket-page { min-height: 100vh; display: grid; grid-template-columns: 218px minmax(0, 1fr); background: var(--color-canvas-root); }
.side-rail { position: sticky; top: 0; height: 100vh; padding: 1.2rem .8rem .75rem; border-right: 1px solid var(--color-hairline-stroke); background: #080b10; display: flex; flex-direction: column; gap: .35rem; }
.rail-brand { padding: .25rem .3rem 1.3rem; border-bottom: 1px solid var(--color-hairline-stroke); margin-bottom: .75rem; }
.rail-brand .brand-mark { width: 180px; }
.rail-label { color: var(--color-text-ghost); padding: .35rem .5rem; }
.rail-link { min-height: 38px; display: flex; gap: .7rem; align-items: center; padding: 0 .65rem; color: var(--color-text-muted); font-size: 12px; border-radius: var(--radius-xs); }
a.rail-link { text-decoration: none; }
.rail-link.active, .rail-link:hover { color: var(--color-primary); background: var(--color-primary-dim); }
.rail-spacer { flex: 1; }
.sandbox-status, .rail-port { font: 9px var(--font-mono); }
.sandbox-status { color: var(--color-secondary); display: flex; align-items: center; gap: 7px; padding: .7rem .2rem; border-top: 1px solid var(--color-hairline-stroke); }
.rail-port { color: var(--color-text-ghost); padding-left: .2rem; }
.online-dot { width: 7px; height: 7px; display: inline-block; border-radius: 50%; background: var(--color-secondary); box-shadow: 0 0 9px var(--color-secondary-glow); }
.docket-main { width: min(1600px, 100%); padding: clamp(1.2rem, 2.5vw, 2.5rem); margin: 0 auto; }
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; margin-bottom: 1.4rem; }
.eyebrow { display: flex; align-items: center; gap: .6rem; color: var(--color-text-muted); margin-bottom: .65rem; }
h1, h2, h3 { font-family: var(--font-display); }
h1 { font-size: clamp(1.7rem, 3vw, 2.4rem); letter-spacing: -.04em; text-transform: uppercase; }
h1 span { color: var(--color-primary); padding: 0 .25rem; }
.subheading { color: var(--color-text-muted); margin-top: .5rem; }
.summary-stats { padding: .7rem 1rem; display: flex; gap: 2rem; }
.summary-stats div { display: flex; flex-direction: column; gap: .25rem; }
.summary-stats .label-mono { color: var(--color-text-muted); font-size: 8px; }
.summary-stats strong { font: 700 20px var(--font-mono); color: var(--color-primary); }
.summary-stats small { font-size: 12px; color: var(--color-text-muted); }
.progress-panel { padding: .85rem 1rem; margin-bottom: 1.4rem; background: linear-gradient(100deg, rgba(0, 255, 133, .08), rgba(0, 240, 255, .07)); }
.progress-heading { display: flex; justify-content: space-between; flex-wrap: wrap; gap: .5rem; font-size: 9px; color: var(--color-text-muted); margin-bottom: .65rem; }
.progress-heading .ready { color: var(--color-secondary); }
.progress-heading .waiting { color: var(--color-primary); }
.progress-track { height: 7px; border-radius: 8px; background: var(--color-hairline-stroke); overflow: hidden; }
.progress-track span { display: block; height: 100%; background: linear-gradient(90deg, var(--color-secondary), var(--color-primary)); transition: width .25s ease; }
.docket-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(235px, 290px); gap: 1.3rem; align-items: start; }
.case-column, .intel-column { min-width: 0; }
.section-heading, .audit-heading { display: flex; align-items: center; justify-content: space-between; gap: .75rem; margin: .2rem 0 .75rem; }
.section-heading h2 { font-size: 15px; text-transform: uppercase; }
.section-heading h2 span { color: var(--color-text-muted); font-weight: 400; }
.section-heading > span, .audit-heading > span { color: var(--color-text-ghost); font-size: 8px; }
.cases-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .7rem; }
.case-card { min-height: 218px; display: flex; flex-direction: column; padding: .9rem; transition: border-color .15s ease, transform .15s ease, box-shadow .15s ease; }
.case-card:hover:not(.locked) { transform: translateY(-2px); border-color: var(--color-primary-border); box-shadow: 0 7px 26px rgba(0, 240, 255, .07); }
.case-card.locked { opacity: .58; }
.case-card.cleared { border-color: rgba(0, 255, 133, .27); }
.case-card-top { display: flex; align-items: center; gap: .5rem; }
.case-card-top .status-pill { flex: 0 0 auto; }
.case-state { color: var(--color-text-muted); font: 700 8px var(--font-mono); }
.case-state.active, .case-state.done { color: var(--color-secondary); }
.difficulty { margin-left: auto; color: var(--color-text-ghost); font-size: 11px; white-space: nowrap; }
.difficulty .lit { color: var(--color-primary); }
.case-card h3 { margin: .8rem 0 .35rem; font-size: 16px; }
.case-description { min-height: 36px; color: var(--color-text-muted); font-size: 11px; line-height: 1.5; }
.case-meta { margin: .7rem 0; padding: .42rem .5rem; border-radius: 2px; background: var(--color-canvas-root); display: flex; justify-content: space-between; gap: .5rem; font: 8px var(--font-mono); color: var(--color-text-muted); }
.case-meta b { color: var(--color-primary); font-weight: 500; }
.locked-meta { color: var(--color-tertiary); }
.locked-meta b { color: var(--color-text-ghost); }
.case-action { width: 100%; margin-top: auto; min-height: 32px; font-size: 9px; }
.case-action:disabled { opacity: .6; cursor: not-allowed; }
.state-panel { padding: 2rem; text-align: center; color: var(--color-text-muted); }
.state-panel.error { color: var(--color-tertiary); }
.persistence-warning { padding: .65rem .8rem; margin: -.8rem 0 1rem; border: 1px solid var(--color-amber-border); background: var(--color-amber-dim); color: var(--color-amber); font-size: 10px; }
.audit-log { padding: .8rem; margin-top: .8rem; }
.audit-heading { margin: 0 0 .6rem; }
.audit-heading span:first-child { color: var(--color-text-primary); }
.audit-row { display: flex; align-items: center; gap: .5rem; padding: .45rem .55rem; margin-top: .25rem; background: var(--color-canvas-root); font: 9px var(--font-mono); color: var(--color-text-muted); }
.audit-row .online-dot { width: 6px; height: 6px; flex: 0 0 auto; }
.audit-row b { color: var(--color-secondary); }
.audit-row.muted { color: var(--color-text-ghost); }
.intel-column { display: flex; flex-direction: column; gap: .75rem; }
.operator-card { display: grid; grid-template-columns: 44px 1fr auto; align-items: center; gap: .5rem; padding: .75rem; }
.operator-avatar { width: 44px; height: 44px; display: grid; place-items: center; background: var(--color-primary-dim); border: 1px solid var(--color-primary-border); color: var(--color-primary); font: 700 11px var(--font-mono); }
.operator-card h2, .intel-heading h2 { font-size: 13px; }
.operator-card p { color: var(--color-text-muted); font-size: 9px; margin-top: .15rem; }
.operator-card .label-mono { color: var(--color-secondary); font-size: 8px; }
.operator-level { align-self: start; font: 700 8px var(--font-mono); color: var(--color-primary); padding: .2rem; background: var(--color-primary-dim); }
.operator-score { grid-column: span 1; padding: .5rem; background: var(--color-canvas-root); display: flex; flex-direction: column; gap: .3rem; color: var(--color-text-muted); font: 8px var(--font-mono); }
.operator-score b { color: var(--color-primary); font-size: 9px; }
.intel-card { padding: .8rem; }
.intel-heading { display: flex; align-items: center; gap: .5rem; }
.intel-heading h2 { flex: 1; }
.intel-heading .label-mono { color: var(--color-primary); font-size: 8px; }
blockquote { padding: .75rem; margin: .65rem 0; background: var(--color-canvas-root); color: var(--color-text-muted); font-size: 11px; line-height: 1.65; border-left: 2px solid var(--color-primary); }
.intel-footer { display: flex; justify-content: space-between; color: var(--color-text-ghost); font: 8px var(--font-mono); }
.telemetry-bars { height: 70px; padding: .7rem; margin: .7rem 0; display: flex; align-items: flex-end; justify-content: space-between; gap: 5px; background: var(--color-canvas-root); }
.telemetry-bars span { flex: 1; max-width: 15px; background: linear-gradient(0deg, rgba(0, 240, 255, .2), var(--color-primary)); border-radius: 2px 2px 0 0; }
.telemetry-row { display: flex; justify-content: space-between; gap: .4rem; margin-top: .5rem; font: 8px var(--font-mono); color: var(--color-text-muted); }
.telemetry-row b { color: var(--color-secondary); font-weight: 500; }
.settings-button { display: flex; justify-content: space-between; gap: .5rem; padding: .5rem; margin-top: .4rem; border: 1px solid var(--color-hairline-stroke); background: var(--color-surface-raised); color: var(--color-text-muted); text-align: left; font: 8px var(--font-mono); cursor: pointer; }
.settings-button:hover, .settings-button:focus-visible { border-color: var(--color-primary); color: var(--color-primary); }
.settings-button b { color: var(--color-primary); }
.reset-button b { color: var(--color-tertiary); }

@media (max-width: 1050px) { .docket-layout { grid-template-columns: minmax(0, 1fr) 235px; } .cases-grid { grid-template-columns: 1fr; } }
@media (max-width: 760px) { .docket-page { grid-template-columns: 1fr; } .side-rail { position: static; height: auto; flex-direction: row; align-items: center; overflow: auto; padding: .6rem; } .rail-brand { border: 0; margin: 0; padding: 0; flex: 0 0 160px; } .rail-brand .brand-mark { width: 155px; } .rail-label, .rail-spacer, .rail-port, .sandbox-status { display: none; } .rail-link { white-space: nowrap; } .docket-main { padding: 1rem; } .page-heading { align-items: flex-start; flex-direction: column; gap: .8rem; } .summary-stats { width: 100%; justify-content: space-around; } .docket-layout { grid-template-columns: 1fr; } .cases-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 540px) { .cases-grid { grid-template-columns: 1fr; } .section-heading { align-items: flex-start; flex-direction: column; } .case-card { min-height: 200px; } }
</style>
