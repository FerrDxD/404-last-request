<template>
  <section class="application-panel" aria-label="Simulated application">
    <div class="browser-bar">
      <div class="window-dots" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="address"><span class="lock">▣</span> {{ application?.brand || 'Pulse Vault' }} · {{ route }}</div>
      <span class="browser-action" aria-hidden="true">↻</span>
    </div>
    <div class="preview-content">
      <div class="app-window">
        <div class="app-brand">
          <span class="brand-icon">{{ brandInitials }}</span>
          <b>{{ application?.brand || 'Pulse Vault' }}</b>
          <span class="env-label">{{ application?.environment || 'STAGING' }}</span>
        </div>
        <div v-if="screen" class="screen-card">
          <div class="screen-context">
            <span class="label-mono">{{ screen.eyebrow }}</span>
            <span class="status-pill" :class="screen.statusTone">{{ screen.status }}</span>
          </div>
          <div class="screen-icon" :class="screen.statusTone" aria-hidden="true">{{ screen.icon }}</div>
          <h2>{{ screen.title }}</h2>
          <p class="screen-description">{{ screen.description }}</p>
          <div class="screen-notice" :class="screen.statusTone" role="status">
            <b>{{ interactionMessage ? 'RETRY RESULT' : 'INCIDENT NOTICE' }}</b>
            <span>{{ interactionMessage || screen.notice }}</span>
          </div>
          <label v-for="field in screen.fields || []" :key="field.label" class="screen-field">
            <span>{{ field.label }}</span>
            <input class="input" :type="field.type || 'text'" :value="field.value" readonly>
          </label>
          <div class="endpoint">
            <span class="label-mono">{{ screen.request.method }} · {{ screen.request.status }}</span>
            <code>{{ screen.request.url }}</code>
          </div>
          <div class="screen-metrics">
            <div v-for="metric in screen.metrics" :key="metric.label">
              <span>{{ metric.label }}</span><b>{{ metric.value }}</b>
            </div>
          </div>
          <button class="screen-button" type="button" @click="retryRequest">{{ screen.actionLabel }} <span aria-hidden="true">→</span></button>
        </div>
        <div v-else class="generic-preview">
          <span class="generic-icon" aria-hidden="true">!</span>
          <p class="label-mono">APPLICATION PREVIEW</p>
          <h2>{{ componentTitle }}</h2>
          <p>{{ caseDefinition?.content.objective.description }}</p>
        </div>
      </div>
    </div>
    <div class="preview-status">
      <span><i></i> ROUTE: {{ route }}</span>
      <span>{{ application?.components?.length || 0 }} SIMULATED COMPONENTS</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCaseStore } from '@/stores/case.store'

const caseStore = useCaseStore()
const caseDefinition = computed(() => caseStore.caseDefinition)
const application = computed(() => caseDefinition.value?.content.application)
const screen = computed(() => application.value?.screen)
const route = computed(() => application.value?.initialRoute || '/')
const brandInitials = computed(() => (application.value?.brand || 'PV').slice(0, 2).toUpperCase())
const componentTitle = computed(() => caseDefinition.value?.content.application.components?.[0]?.type || 'Broken application')
const interactionMessage = ref('')

watch(() => caseDefinition.value?.slug, () => {
  interactionMessage.value = ''
})

function retryRequest() {
  if (screen.value) interactionMessage.value = screen.value.interactionResult
  const request = caseDefinition.value?.content.evidence.find(item => {
    if (item.type !== 'network' || typeof item.content !== 'object' || item.content === null) return false
    const content = item.content as Record<string, unknown>
    return content.method === screen.value?.request.method && content.url === screen.value?.request.url
  })
  if (request) caseStore.applyAction({ type: 'inspect', elementId: request.id })
}
</script>

<style scoped>
.application-panel { min-width: 0; display: flex; flex-direction: column; flex: 1 1 auto; background: #080b10; }
.browser-bar { height: 38px; flex: 0 0 auto; display: flex; align-items: center; gap: .8rem; padding: 0 .8rem; background: #131820; border-bottom: 1px solid var(--color-hairline-stroke); }
.window-dots { display: flex; gap: 5px; }
.window-dots i { width: 9px; height: 9px; border-radius: 50%; background: #ff6b6b; }
.window-dots i:nth-child(2) { background: #ffbd4a; }
.window-dots i:nth-child(3) { background: var(--color-secondary); }
.address { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: .28rem .6rem; background: #080b10; border: 1px solid var(--color-hairline-stroke); color: var(--color-text-muted); font: 9px var(--font-mono); }
.lock { color: var(--color-secondary); padding-right: .3rem; }
.browser-action { color: var(--color-text-muted); }
.preview-content { flex: 1; min-height: 0; display: grid; place-items: center; overflow: auto; padding: clamp(1rem, 4vw, 3rem); background: radial-gradient(ellipse at center, rgba(25, 37, 48, .55), transparent 68%); }
.app-window { width: min(480px, 100%); min-height: 440px; padding: 1rem; background: #111820; border: 1px solid #293441; border-radius: 9px; box-shadow: 0 20px 60px rgba(0, 0, 0, .38); }
.app-brand { display: flex; align-items: center; gap: .55rem; padding-bottom: .85rem; border-bottom: 1px solid var(--color-hairline-stroke); font: 600 14px var(--font-display); }
.brand-icon { width: 24px; height: 24px; display: grid; place-items: center; background: #d7fbff; color: #101820; font: 700 10px var(--font-mono); }
.env-label { padding: .2rem .35rem; background: var(--color-surface-float); color: var(--color-text-muted); font: 8px var(--font-mono); }
.screen-card { max-width: 380px; margin: 1rem auto .2rem; }
.screen-context { display: flex; justify-content: space-between; align-items: center; gap: .5rem; padding-bottom: .65rem; border-bottom: 1px solid var(--color-hairline-stroke); }
.screen-context .label-mono { color: var(--color-text-muted); font-size: 8px; }
.screen-context .status-pill { flex: 0 0 auto; font-size: 8px; }
.screen-icon { width: 42px; height: 42px; display: grid; place-items: center; margin: 1rem auto .55rem; border-radius: 8px; background: var(--color-tertiary-dim); color: var(--color-tertiary); font: 700 20px var(--font-mono); }
.screen-icon.warning { background: var(--color-amber-dim); color: var(--color-amber); }
.screen-icon.success { background: var(--color-secondary-dim); color: var(--color-secondary); }
.screen-icon.info { background: var(--color-primary-dim); color: var(--color-primary); }
.screen-card h2, .generic-preview h2 { text-align: center; font: 700 clamp(18px, 2vw, 23px)/1.2 var(--font-display); }
.screen-description { max-width: 340px; margin: .35rem auto .8rem; text-align: center; color: var(--color-text-muted); font-size: 10px; line-height: 1.55; }
.screen-notice { padding: .55rem; display: flex; flex-direction: column; gap: .25rem; border: 1px solid var(--color-tertiary-border); background: var(--color-tertiary-dim); color: #ffabb8; font-size: 9px; line-height: 1.45; }
.screen-notice.warning { border-color: var(--color-amber-border); background: var(--color-amber-dim); color: var(--color-amber); }
.screen-notice.success { border-color: var(--color-secondary-border); background: var(--color-secondary-dim); color: var(--color-secondary); }
.screen-notice.info { border-color: var(--color-primary-border); background: var(--color-primary-dim); color: var(--color-primary); }
.screen-notice b { font: 700 8px var(--font-mono); }
.screen-field { display: block; margin-top: .55rem; color: var(--color-text-muted); font: 9px var(--font-mono); }
.screen-field .input { width: 100%; display: block; margin-top: .25rem; height: 32px; }
.endpoint { display: flex; justify-content: space-between; gap: .5rem; margin-top: .65rem; padding: .5rem; background: var(--color-canvas-root); }
.endpoint .label-mono { flex: 0 0 auto; color: var(--color-text-ghost); font-size: 8px; }
.endpoint code { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-primary); font: 9px var(--font-mono); }
.screen-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(115px, 1fr)); gap: .4rem; margin-top: .4rem; }
.screen-metrics div { min-width: 0; display: flex; flex-direction: column; gap: .25rem; padding: .5rem; background: var(--color-surface-raised); }
.screen-metrics span { color: var(--color-text-muted); font: 8px var(--font-mono); }
.screen-metrics b { overflow-wrap: anywhere; color: var(--color-text-primary); font: 700 10px var(--font-mono); }
.screen-button { width: 100%; height: 36px; margin-top: .65rem; padding: 0 .7rem; border: 0; background: #d7fbff; color: #091114; font: 700 9px var(--font-mono); cursor: pointer; }
.screen-button:hover { box-shadow: 0 0 16px rgba(0, 240, 255, .2); }
.screen-button span { float: right; }
.generic-preview { max-width: 290px; margin: 3rem auto; text-align: center; }
.generic-icon { width: 48px; height: 48px; margin: 0 auto 1rem; display: grid; place-items: center; background: var(--color-tertiary-dim); color: var(--color-tertiary); border-radius: 8px; font: 700 24px var(--font-mono); }
.generic-preview .label-mono { color: var(--color-primary); }
.generic-preview > p:last-child { margin-top: .65rem; color: var(--color-text-muted); line-height: 1.6; }
.preview-status { display: flex; justify-content: space-between; gap: .5rem; padding: .45rem .75rem; border-top: 1px solid var(--color-hairline-stroke); color: var(--color-text-ghost); font: 8px var(--font-mono); }
.preview-status i { width: 6px; height: 6px; display: inline-block; border-radius: 50%; margin-right: .3rem; background: var(--color-primary); }
@media (max-width: 760px) { .preview-content { overflow: visible; } .app-window { min-height: 0; } }
</style>
