<template>
  <section class="network-panel">
    <div v-if="networkRequests.length" class="network-requests">
      <button
        v-for="request in networkRequests"
        :key="request.evidenceId"
        class="network-request"
        :class="{ active: selectedRequest?.evidenceId === request.evidenceId }"
        :aria-expanded="selectedRequest?.evidenceId === request.evidenceId"
        @click="selectRequest(request)"
      >
        <span class="request-header">
          <span class="status-pill method" :class="request.content.method.toLowerCase()">{{ request.content.method }}</span>
          <span class="url code-base">{{ request.content.url }}</span>
          <span class="status-pill" :class="getStatusClass(request.content.status)">{{ request.content.status }}</span>
        </span>
        <span class="request-details">
          <span class="detail"><span class="label-mono label">DURATION</span><span class="code-compact value">{{ request.content.duration ?? '—' }}{{ request.content.duration === undefined ? '' : 'ms' }}</span></span>
        </span>
      </button>
      <section v-if="selectedRequest" class="request-payload" aria-live="polite">
        <div class="payload-heading"><span class="label-mono">REQUEST PAYLOAD</span><span class="status-pill" :class="getStatusClass(selectedRequest.content.status)">{{ selectedRequest.content.status }}</span></div>
        <pre v-if="selectedRequest.content.request !== undefined" class="code-base">{{ formatPayload(selectedRequest.content.request) }}</pre>
        <span v-else class="empty-payload">No request payload.</span>
        <div class="payload-heading response-heading"><span class="label-mono">RESPONSE BODY</span></div>
        <pre v-if="selectedRequest.content.response !== undefined" class="code-base">{{ formatPayload(selectedRequest.content.response) }}</pre>
        <span v-else class="empty-payload">No response body.</span>
      </section>
    </div>
    <p v-else class="empty-state">No network requests were recorded for this case.</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCaseStore } from '@/stores/case.store'
import type { NetworkRequest } from '@404-last-request/shared'

const caseStore = useCaseStore()
const networkRequests = computed(() => {
  const evidence = caseStore.caseDefinition?.content.evidence || []
  return evidence
    .filter(item => item.type === 'network')
    .map(item => ({ evidenceId: item.id, content: item.content as NetworkRequest }))
})
const selectedRequest = ref<(typeof networkRequests.value)[number] | null>(null)

watch(() => caseStore.caseDefinition?.slug, () => {
  selectedRequest.value = null
})

function selectRequest(request: (typeof networkRequests.value)[number]) {
  selectedRequest.value = request
  caseStore.applyAction({ type: 'inspect', elementId: request.evidenceId })
}

function formatPayload(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2)
}

function getStatusClass(status: number): string {
  if (status >= 200 && status < 300) return 'success'
  if (status >= 300 && status < 400) return 'warning'
  if (status >= 400) return 'danger'
  return ''
}
</script>

<style scoped>
.network-panel { height: 100%; display: flex; flex-direction: column; background: var(--color-canvas-root); }
.network-requests { flex: 1; overflow-y: auto; padding: var(--space-md); }
.network-request { width: 100%; display: block; background: var(--color-surface-raised); border: 1px solid var(--color-hairline-stroke); border-radius: var(--radius-xs); padding: var(--space-sm); margin-bottom: var(--space-sm); color: inherit; text-align: left; cursor: pointer; }
.network-request:hover, .network-request.active { border-color: var(--color-primary); background: var(--color-primary-dim); }
.request-header { display: flex; align-items: center; gap: var(--space-sm); }
.method { min-width: 48px; }
.method.get { border-color: var(--color-primary-border); background: var(--color-primary-dim); color: var(--color-primary); }
.method.post { border-color: var(--color-secondary-border); background: var(--color-secondary-dim); color: var(--color-secondary); }
.method.put, .method.patch { border-color: var(--color-amber-border); background: var(--color-amber-dim); color: var(--color-amber); }
.method.delete { border-color: var(--color-tertiary-border); background: var(--color-tertiary-dim); color: var(--color-tertiary); }
.url { flex: 1; min-width: 0; color: var(--color-text-primary); overflow-wrap: anywhere; }
.request-details { display: flex; gap: var(--space-md); margin-top: .35rem; }
.detail { display: flex; gap: var(--space-sm); }
.label { color: var(--color-text-ghost); }
.value { color: var(--color-text-primary); }
.request-payload { padding: .65rem; margin-top: .6rem; border: 1px solid var(--color-hairline-stroke); background: var(--color-panel-base); }
.payload-heading { display: flex; align-items: center; justify-content: space-between; gap: .5rem; color: var(--color-text-muted); }
.payload-heading .label-mono { font-size: 8px; }
.request-payload pre { max-height: 180px; overflow: auto; padding: .6rem; margin-top: .4rem; background: var(--color-canvas-root); color: var(--color-text-primary); white-space: pre-wrap; overflow-wrap: anywhere; }
.response-heading { margin-top: .7rem; }
.empty-payload, .empty-state { display: block; color: var(--color-text-muted); font-size: 10px; }
.empty-payload { margin-top: .4rem; }
.empty-state { margin: auto; padding: 1.5rem; text-align: center; }
</style>
