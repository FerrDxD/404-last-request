<template>
  <div class="files-panel">
    <div v-if="files.length" class="file-tree">
      <button
        v-for="file in files"
        :key="file.path"
        class="file-item"
        :class="{ active: selectedFile?.path === file.path }"
        :aria-pressed="selectedFile?.path === file.path"
        @click="openFile(file)"
      >
        <span class="file-icon">{{ getFileIcon(file.type) }}</span>
        <span class="file-name code-base">{{ file.path }}</span>
      </button>
    </div>
    <p v-else class="empty-state">No virtual project files were attached to this case.</p>
    <div class="file-content" v-if="selectedFile">
      <div class="file-header label-mono">{{ selectedFile.path }}</div>
      <pre class="file-code code-base">{{ selectedFile.content }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCaseStore } from '@/stores/case.store'
import type { VirtualFile } from '@404-last-request/shared'

const caseStore = useCaseStore()
const selectedFile = ref<VirtualFile | null>(null)

const files = computed<VirtualFile[]>(() => {
  const evidence = caseStore.caseDefinition?.content.evidence || []
  return evidence
    .filter(e => e.type === 'file')
    .map(e => e.content as VirtualFile)
})

function getFileIcon(type: string): string {
  switch (type) {
    case 'code':
      return '📄'
    case 'config':
      return '⚙️'
    case 'documentation':
      return '📖'
    default:
      return '📁'
  }
}

function openFile(file: VirtualFile) {
  selectedFile.value = file
  caseStore.applyAction({ type: 'openFile', filePath: file.path })
}
</script>

<style scoped>
.files-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-canvas-root);
}

.file-tree {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-sm);
  border-bottom: 1px solid var(--color-hairline-stroke);
}

.file-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all 0.15s ease;
  min-height: var(--height-row);
  border: 1px solid transparent;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.file-item:hover {
  background: var(--color-surface-raised);
}

.file-item.active {
  background: var(--color-primary-dim);
  border: 1px solid var(--color-primary-border);
}

.empty-state { padding: 1.5rem; color: var(--color-text-muted); text-align: center; font-size: 10px; }
.file-icon {
  font-size: 12px;
}

.file-name {
  color: var(--color-text-primary);
}

.file-content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.file-header {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface-raised);
  border-bottom: 1px solid var(--color-hairline-stroke);
  color: var(--color-text-muted);
}

.file-code {
  flex: 1;
  padding: var(--space-md);
  margin: 0;
  color: var(--color-text-primary);
  line-height: 1.5;
  overflow: auto;
}
</style>
