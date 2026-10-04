<template>
  <div class="debrief-page" :class="{ victory }">
    <aside class="side-rail">
      <RouterLink to="/" class="rail-brand" aria-label="Go to home"><BrandMark /></RouterLink>
      <p class="label-mono rail-label">EXPLORER // NODES</p>
      <RouterLink to="/cases" class="rail-link">▣ <span>Mission docket</span></RouterLink>
      <RouterLink to="/cases#audit-log" class="rail-link">◉ <span>Incident logs</span></RouterLink>
      <a href="#post-mortem-diff" class="rail-link active">▤ <span>Post-mortem diff</span></a>
      <div class="rail-spacer"></div>
      <div class="sandbox-status"><span></span> SANDBOX CONNECTED</div>
      <span class="label-mono rail-port">PORT 9229</span>
    </aside>

    <main class="debrief-main">
      <div v-if="loading" class="state-panel">LOADING POST-MORTEM RECORD…</div>
      <div v-else-if="error" class="state-panel error">
        <p>{{ error }}</p>
        <RouterLink to="/cases">RETURN TO MISSION DOCKET</RouterLink>
      </div>
      <template v-else>
        <div class="resolution-bar">
          <span><i></i> CASE RESOLVED // HOTFIX DEPLOYED</span>
          <span>{{ caseDefinition?.content.application.environment || 'SIMULATED ENVIRONMENT' }}</span>
          <RouterLink to="/cases">ESC / CLOSE HUD ×</RouterLink>
        </div>
        <header class="debrief-heading">
          <div>
            <p class="label-mono eyebrow">INCIDENT ESCALATION DEBRIEF <span>·</span> MISSION CERTIFIED</p>
            <h1>{{ victory ? 'CAMPAIGN VICTORY // PRODUCTION LAUNCH' : `CASE ${caseNumber}: ${caseTitle}` }}</h1>
            <p>{{ victory ? 'All production incidents resolved. The launch window is secure.' : caseDefinition?.description || 'The production hotfix has been verified and deployed to staging.' }}</p>
          </div>
          <div class="rating-card panel">
            <div class="stars">{{ ratingStars }}</div>
            <span class="label-mono">{{ ratingLabel }}</span>
            <strong>{{ score.toLocaleString() }} <small>PTS</small></strong>
          </div>
        </header>

        <section class="metrics-grid">
          <article class="metric-card panel"><div class="metric-top"><span>ELAPSED TIME</span><b>◷</b></div><strong class="green">{{ formatTime(elapsedTime) }}</strong><div class="metric-bottom">RUN DURATION <b>{{ timeDelta }}</b></div><div class="meter"><i :style="{ width: `${timeMeter}%` }"></i></div></article>
          <article class="metric-card panel"><div class="metric-top"><span>ATTEMPTS</span><b>◇</b></div><strong>{{ attempts }} {{ attempts === 1 ? 'ATTEMPT' : 'ATTEMPTS' }}</strong><div class="metric-bottom">VALIDATION <b>{{ attempts === 1 ? 'FIRST PASS' : 'VERIFIED' }}</b></div><div class="meter cyan"><i :style="{ width: `${Math.max(18, 100 - (attempts - 1) * 15)}%` }"></i></div></article>
          <article class="metric-card panel"><div class="metric-top"><span>HINTS TAKEN</span><b>◎</b></div><strong>{{ hintsUsed }} / 3 HINTS</strong><div class="metric-bottom">PENALTY <b>{{ hintsUsed * 100 }} PTS LOST</b></div><div class="meter"><i :style="{ width: `${100 - hintsUsed * 25}%` }"></i></div></article>
          <article class="metric-card panel"><div class="metric-top"><span>PATCHES VERIFIED</span><b>◴</b></div><strong class="green">{{ requiredChanges.length }}</strong><div class="metric-bottom">REQUIRED TARGETS <b>ALL VERIFIED</b></div><div class="meter"><i :style="{ width: `${patchMeter}%` }"></i></div></article>
        </section>

        <section class="debrief-columns">
          <article id="post-mortem-diff" class="pipeline panel">
            <header class="panel-heading"><h2>▣ Automated pipeline verification</h2><span class="status-pill success">ALL CHECKS PASSED</span></header>
            <div class="pipeline-row"><span class="pass-icon">✓</span><div><b>Incident objective</b><small>{{ caseDefinition?.content.objective.description || 'Case objective verified against the required changes.' }}</small></div><span class="status-pill success">RESOLVED</span></div>
            <div v-for="change in requiredChanges" :key="change.target" class="pipeline-row"><span class="pass-icon">✓</span><div><b>{{ change.target }}</b><small>Required patch value verified by the case evaluator.</small></div><span class="status-pill success">PASSED</span></div>
            <div class="pipeline-graph"><span>DEPLOY VELOCITY</span><div><i></i><i></i><i></i><i></i><i></i></div><b>STABLE</b></div>
          </article>
          <article class="comms panel">
            <header class="panel-heading"><h2># war-room-case-{{ caseNumber }}</h2><span class="label-mono">MAYA // PM</span></header>
            <div class="comms-message">
              <div class="avatar">M</div><b>Maya Lin <small>LEAD PM · NOW</small></b>
              <p>{{ victory ? 'Launch is green. The incident team is clear to ship—excellent work getting every system back online.' : `“That fix is verified and the staging build is green. Nice work tracking down the root cause in ${caseTitle}.”` }}</p>
            </div>
            <div class="commit">
              <span class="label-mono">HOTFIX // VERIFIED</span>
              <b>{{ patchTargets }}</b>
              <small>Patch accepted · {{ attempts }} validation run{{ attempts === 1 ? '' : 's' }}</small>
            </div>
            <div class="reward"><span>◉ MISSION REWARD CREDITED</span><b>+{{ score }} PTS</b></div>
          </article>
        </section>

        <footer class="debrief-actions panel">
          <RouterLink :to="`/play/${caseSlug}`" class="btn btn-secondary">↻ Replay case {{ caseNumber }}</RouterLink>
          <RouterLink to="/cases" class="btn btn-primary next-button">
            {{ victory ? 'RETURN TO MISSION DOSSIER' : 'PROCEED TO NEXT INCIDENT →' }}
          </RouterLink>
        </footer>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { CaseDefinition, CaseMetadata } from '@404-last-request/shared'
import BrandMark from '@/components/BrandMark.vue'
import { fetchCase, fetchCases } from '@/services/api'
import { useProgressStore } from '@/stores/progress.store'

const route = useRoute()
const progressStore = useProgressStore()
const caseDefinition = ref<CaseDefinition | null>(null)
const caseMetadata = ref<CaseMetadata[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const elapsedTime = computed(() => queryNumber('time') ?? 0)
const attempts = computed(() => queryNumber('attempts') ?? 0)
const hintsUsed = computed(() => queryNumber('hints') ?? 0)
const score = computed(() => queryNumber('score') ?? 0)
const ratingStars = computed(() => typeof route.query.rating === 'string' ? route.query.rating : '')
const caseSlug = computed(() => typeof route.params.caseSlug === 'string' ? route.params.caseSlug : '')
const caseNumber = computed(() => (caseDefinition.value?.order || 1).toString().padStart(2, '0'))
const caseTitle = computed(() => caseDefinition.value?.title || 'Incident resolved')
const victory = computed(() => caseMetadata.value.length > 0 &&
  caseMetadata.value.every(item => progressStore.isCaseCompleted(item.id)))
const ratingLabel = computed(() => score.value >= 900 ? 'PAR TIME CRUSHED' : 'MISSION CERTIFIED')
const requiredChanges = computed(() => caseDefinition.value?.content.solution.requiredChanges || [])
const patchTargets = computed(() => requiredChanges.value.map(change => change.target).join(', '))
const patchMeter = computed(() => requiredChanges.value.length ? 100 : 0)
const timeMeter = computed(() => Math.min(100, Math.max(10, 100 - Math.floor(elapsedTime.value / 1000))))
const timeDelta = computed(() => `${attempts.value} VALIDATION RUN${attempts.value === 1 ? '' : 'S'}`)

onMounted(async () => {
  try {
    progressStore.loadProgress()
    const resultValues = ['time', 'attempts', 'hints', 'score'].map(queryNumber)
    const [definition, cases] = await Promise.all([fetchCase(caseSlug.value), fetchCases()])
    if (resultValues.some(value => value === null) ||
        attempts.value < 1 || hintsUsed.value > 3 || score.value > 1000 ||
        !['★★★★★', '★★★★☆', '★★★☆☆', '★★☆☆☆', '★☆☆☆☆'].includes(ratingStars.value)) {
      throw new Error('This debrief has no valid completed-run record. Complete the case to view its results.')
    }
    caseDefinition.value = definition
    caseMetadata.value = cases
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'An unexpected error occurred while loading the debrief.'
  } finally {
    loading.value = false
  }
})

function queryNumber(key: string): number | null {
  const raw = route.query[key]
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const value = Number(raw)
  return Number.isFinite(value) && Number.isInteger(value) && value >= 0 ? value : null
}

function formatTime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '00:00'
  const totalSeconds = Math.floor(ms / 1000)
  return `${Math.floor(totalSeconds / 60).toString().padStart(2, '0')}:${(totalSeconds % 60).toString().padStart(2, '0')}`
}
</script>

<style scoped>
.debrief-page { min-height: 100vh; display: grid; grid-template-columns: 218px minmax(0, 1fr); background: #090d12; }
.side-rail { position: sticky; top: 0; height: 100vh; padding: 1.2rem .8rem .75rem; border-right: 1px solid var(--color-hairline-stroke); background: #080b10; display: flex; flex-direction: column; gap: .35rem; }
.rail-brand { padding: .25rem .3rem 1.3rem; border-bottom: 1px solid var(--color-hairline-stroke); margin-bottom: .75rem; }
.rail-brand .brand-mark { width: 180px; }
.rail-label { color: var(--color-text-ghost); padding: .35rem .5rem; }
.rail-link { min-height: 38px; display: flex; gap: .7rem; align-items: center; padding: 0 .65rem; color: var(--color-text-muted); font-size: 12px; }
a.rail-link { text-decoration: none; }
.rail-link.active, .rail-link:hover { color: var(--color-primary); background: var(--color-primary-dim); }
.rail-spacer { flex: 1; }
.sandbox-status, .rail-port { font: 9px var(--font-mono); }
.sandbox-status { color: var(--color-secondary); display: flex; align-items: center; gap: 7px; padding: .7rem .2rem; border-top: 1px solid var(--color-hairline-stroke); }
.sandbox-status span, .resolution-bar i { width: 7px; height: 7px; display: inline-block; border-radius: 50%; background: var(--color-secondary); }
.rail-port { color: var(--color-text-ghost); padding-left: .2rem; }
.debrief-main { width: min(1320px, 100%); margin: 0 auto; padding: 1rem clamp(1rem, 2.3vw, 2.2rem) 1.5rem; }
.resolution-bar { min-height: 32px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .5rem; padding: .4rem .7rem; background: var(--color-surface-raised); font: 8px var(--font-mono); color: var(--color-text-muted); }
.resolution-bar span:first-child { display: flex; align-items: center; gap: .45rem; color: var(--color-secondary); font-weight: 700; }
.resolution-bar a { color: var(--color-primary); text-decoration: none; }
.debrief-heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; margin: 1rem 0 1.2rem; }
.eyebrow { color: var(--color-primary); margin-bottom: .45rem; font-size: 9px; }
.eyebrow span { color: var(--color-secondary); }
.debrief-heading h1 { max-width: 800px; font: 700 clamp(1.7rem, 3.5vw, 2.8rem)/1.1 var(--font-display); letter-spacing: -.035em; }
.debrief-heading > div:first-child > p:last-child { margin-top: .5rem; color: var(--color-text-muted); font-size: 12px; }
.rating-card { min-width: 175px; display: grid; grid-template-columns: 1fr auto; align-items: center; gap: .2rem .6rem; padding: .6rem .8rem; }
.stars { color: var(--color-secondary); font-size: 20px; letter-spacing: .1em; }
.rating-card .label-mono { grid-column: 1; color: var(--color-secondary); font-size: 8px; }
.rating-card strong { grid-column: 2; grid-row: 1 / 3; font: 700 22px var(--font-mono); }
.rating-card small { color: var(--color-text-muted); font-size: 9px; }
.metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .55rem; }
.metric-card { padding: .7rem; min-width: 0; }
.metric-top, .metric-bottom { display: flex; align-items: center; justify-content: space-between; gap: .4rem; }
.metric-top { color: var(--color-text-muted); font: 9px var(--font-mono); }
.metric-top b { color: var(--color-secondary); font-size: 15px; }
.metric-card > strong { display: block; margin: .65rem 0; color: var(--color-text-primary); font: 700 clamp(14px, 2vw, 20px) var(--font-display); white-space: nowrap; }
.metric-card > strong.green { color: var(--color-secondary); }
.metric-bottom { color: var(--color-text-muted); font: 8px var(--font-mono); }
.metric-bottom b { color: var(--color-primary); font-weight: 500; }
.meter { height: 5px; margin-top: .55rem; background: var(--color-canvas-root); }
.meter i { display: block; height: 100%; background: var(--color-secondary); }
.meter.cyan i { background: var(--color-primary); }
.debrief-columns { display: grid; grid-template-columns: 1.2fr .8fr; gap: .7rem; margin-top: .8rem; }
.pipeline, .comms { padding: .75rem; }
.panel-heading { display: flex; justify-content: space-between; align-items: center; gap: .5rem; margin-bottom: .6rem; }
.panel-heading h2 { font: 700 13px var(--font-display); }
.panel-heading .label-mono { color: var(--color-text-muted); font-size: 8px; }
.panel-heading .status-pill { font-size: 8px; }
.pipeline-row { display: flex; align-items: center; gap: .6rem; min-height: 49px; padding: .55rem; margin-top: .35rem; background: var(--color-surface-raised); }
.pass-icon { width: 21px; height: 21px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 50%; background: var(--color-secondary-dim); color: var(--color-secondary); font-weight: 700; }
.pipeline-row > div { flex: 1; min-width: 0; }
.pipeline-row b, .pipeline-row small { display: block; }
.pipeline-row b { font: 600 10px var(--font-display); }
.pipeline-row small { margin-top: .2rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-text-muted); font-size: 9px; }
.pipeline-row .status-pill { font-size: 7px; }
.pipeline-graph { display: flex; align-items: center; gap: .6rem; margin-top: .5rem; padding: .45rem; background: var(--color-canvas-root); color: var(--color-text-muted); font: 8px var(--font-mono); }
.pipeline-graph div { display: flex; align-items: flex-end; gap: 3px; height: 19px; margin-left: auto; }
.pipeline-graph i { width: 6px; height: 11px; background: var(--color-secondary); border-radius: 2px; }
.pipeline-graph i:nth-child(2) { height: 15px; }
.pipeline-graph i:nth-child(3) { height: 10px; }
.pipeline-graph i:nth-child(4) { height: 18px; }
.pipeline-graph i:nth-child(5) { height: 14px; }
.pipeline-graph b { color: var(--color-secondary); }
.comms-message { padding: .7rem; background: var(--color-surface-raised); min-height: 120px; }
.avatar { float: left; width: 30px; height: 30px; display: grid; place-items: center; margin: 0 .5rem .3rem 0; border-radius: 50%; background: #79535a; color: #fff; font: 700 14px var(--font-display); }
.comms-message > b { display: block; padding-top: .15rem; font: 700 10px var(--font-display); }
.comms-message > b small { float: right; color: var(--color-text-ghost); font: 8px var(--font-mono); }
.comms-message p { clear: both; padding-top: .55rem; color: var(--color-text-primary); font-size: 10px; line-height: 1.55; }
.commit { display: flex; flex-direction: column; gap: .35rem; padding: .7rem .2rem; }
.commit .label-mono { color: var(--color-primary); font-size: 8px; }
.commit b { color: var(--color-text-primary); font: 600 10px var(--font-mono); overflow-wrap: anywhere; }
.commit small { color: var(--color-text-muted); font-size: 9px; }
.reward { display: flex; justify-content: space-between; gap: .5rem; padding: .55rem; background: var(--color-secondary-dim); color: var(--color-secondary); font: 700 8px var(--font-mono); }
.reward b { color: var(--color-text-primary); }
.debrief-actions { display: flex; align-items: center; gap: .5rem; margin-top: .75rem; padding: .55rem; }
.debrief-actions .btn { min-height: 34px; font-size: 9px; }
.next-button { flex: 1; }
.state-panel { padding: 3rem 1rem; color: var(--color-primary); text-align: center; font: 11px var(--font-mono); }
.state-panel.error { color: var(--color-tertiary); }
.victory .resolution-bar span:first-child { color: var(--color-primary); }
@media (max-width: 900px) { .debrief-page { grid-template-columns: 1fr; } .side-rail { position: static; height: auto; flex-direction: row; align-items: center; overflow: auto; padding: .6rem; } .rail-brand { border: 0; margin: 0; padding: 0; flex: 0 0 160px; } .rail-brand .brand-mark { width: 155px; } .rail-label, .rail-spacer, .rail-port, .sandbox-status { display: none; } .rail-link { white-space: nowrap; } }
@media (max-width: 650px) { .debrief-heading { align-items: flex-start; flex-direction: column; } .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .debrief-columns { grid-template-columns: 1fr; } .resolution-bar span:nth-child(2) { display: none; } .pipeline-row .status-pill { display: none; } }
</style>
