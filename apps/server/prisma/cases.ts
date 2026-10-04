import type { CaseDefinition, EvidenceDefinition, NetworkRequest } from '@404-last-request/shared'

const tools: CaseDefinition['content']['tools'] = [
  { id: 'console', name: 'Console', type: 'console' },
  { id: 'network', name: 'Network', type: 'network' },
  { id: 'files', name: 'Files', type: 'files' },
  { id: 'inspector', name: 'Inspector', type: 'inspector' }
]

interface CaseSeed {
  slug: string
  title: string
  description: string
  difficulty: number
  order: number
  route: string
  icon: string
  eyebrow: string
  screenTitle: string
  screenDescription: string
  status: string
  statusTone: 'danger' | 'warning'
  notice: string
  request: NetworkRequest
  metrics: Array<{ label: string; value: string }>
  fields?: Array<{ label: string; value: string; type?: 'text' | 'email' | 'password' }>
  actionLabel: string
  interactionResult: string
  console: string
  filePath: string
  fileContent: string
  docsPath: string
  docsContent: string
  inspected: {
    id: string
    tag: string
    attributes: Record<string, string>
    events: string[]
    state: Record<string, unknown>
  }
  action: {
    id: string
    target: string
    allowedValues: string[]
    expected: string
  }
  hints: [string, string, string]
}

function createCase(seed: CaseSeed): CaseDefinition {
  const evidence: EvidenceDefinition[] = [
    {
      id: `${seed.slug}-console`,
      type: 'console',
      content: { level: 'error', message: seed.console }
    },
    {
      id: `${seed.slug}-network`,
      type: 'network',
      content: seed.request
    },
    {
      id: `${seed.slug}-source`,
      type: 'file',
      content: { path: seed.filePath, type: 'code', content: seed.fileContent }
    },
    {
      id: `${seed.slug}-docs`,
      type: 'file',
      content: { path: seed.docsPath, type: 'documentation', content: seed.docsContent }
    },
    {
      id: `${seed.slug}-inspector`,
      type: 'inspector',
      content: seed.inspected
    }
  ]

  return {
    id: `case-${seed.order.toString().padStart(2, '0')}`,
    slug: seed.slug,
    title: seed.title,
    description: seed.description,
    difficulty: seed.difficulty,
    order: seed.order,
    content: {
      objective: { description: seed.description },
      application: {
        initialRoute: seed.route,
        brand: 'Pulse Vault',
        environment: 'STAGING',
        screen: {
          icon: seed.icon,
          eyebrow: seed.eyebrow,
          title: seed.screenTitle,
          description: seed.screenDescription,
          status: seed.status,
          statusTone: seed.statusTone,
          notice: seed.notice,
          request: {
            method: seed.request.method,
            url: seed.request.url,
            status: seed.request.status
          },
          metrics: seed.metrics,
          fields: seed.fields,
          actionLabel: seed.actionLabel,
          interactionResult: seed.interactionResult
        },
        components: [{
          id: seed.inspected.id,
          type: seed.inspected.tag,
          props: seed.inspected.attributes
        }]
      },
      tools,
      evidence,
      actions: [{
        id: seed.action.id,
        type: 'modify',
        target: seed.action.target,
        allowedValues: seed.action.allowedValues
      }],
      solution: {
        requiredChanges: [{ target: seed.action.target, value: seed.action.expected }],
        incompleteMessage: 'You have not staged a patch yet. Follow the evidence trail before running the test.',
        failureMessage: 'The patch is staged, but the regression test still fails. Compare the request with the API contract.',
        successMessage: 'Smoke test passed. The incident is contained and the fix is verified.'
      },
      hints: seed.hints.map((text, index) => ({
        id: `${seed.slug}-hint-${index + 1}`,
        level: (index + 1) as 1 | 2 | 3,
        text
      }))
    }
  }
}

export const caseDefinitions: CaseDefinition[] = [
  createCase({
    slug: 'login-doesnt-work',
    title: 'Login Doesn’t Work',
    description: 'Fix the login request so users can authenticate with the identifier the API expects.',
    difficulty: 1,
    order: 1,
    route: '/login',
    icon: '◈',
    eyebrow: 'IDENTITY GATEWAY // HANDSHAKE REJECTED',
    screenTitle: 'Welcome back',
    screenDescription: 'Sign in to your secure workspace.',
    status: '401 UNAUTHORIZED',
    statusTone: 'danger',
    notice: 'Handshake failed: the login payload does not match the gateway contract.',
    request: {
      id: 'login-request',
      method: 'POST',
      url: '/api/v1/auth/login',
      status: 401,
      request: { username: 'alex.chen@cybercore.io', password: '••••••••••••' },
      response: { error: 'missing_required_field', message: 'Missing required field: email.' },
      duration: 184
    },
    metrics: [{ label: 'PAYLOAD FIELD', value: 'username' }, { label: 'GATEWAY EXPECTS', value: 'email' }],
    fields: [
      { label: 'Work email address', value: 'alex.chen@cybercore.io', type: 'email' },
      { label: 'Authentication token', value: 'session-token', type: 'password' }
    ],
    actionLabel: 'Attempt secure login',
    interactionResult: 'The gateway rejected the request. The developer tools have the details.',
    console: 'TypeError: Login rejected — missing required field "email".',
    filePath: '/src/services/auth.ts',
    fileContent: `export async function login(input: LoginInput) {
  return client.post('/api/v1/auth/login', {
    username: input.email,
    password: input.password
  })
}

interface LoginInput {
  email: string
  password: string
}`,
    docsPath: '/docs/API.md',
    docsContent: `# Login API

POST /api/v1/auth/login

Required JSON body:
{
  "email": "string",
  "password": "string"
}

The gateway does not accept the legacy "username" field.`,
    inspected: {
      id: 'login-submit',
      tag: 'form',
      attributes: { action: '/api/v1/auth/login', 'data-identifier': 'username' },
      events: ['submitLogin()'],
      state: { authenticated: false, lastStatus: 401 }
    },
    action: {
      id: 'login-identifier',
      target: 'login.request.identifier',
      allowedValues: ['username', 'email'],
      expected: 'email'
    },
    hints: [
      'The login screen is not the only thing rejecting you; check what happens after submit.',
      'Compare the failed request payload with the API notes in Files.',
      'The gateway expects "email", but the client still sends "username".'
    ]
  }),
  createCase({
    slug: 'missing-profile',
    title: 'The Missing Profile',
    description: 'Restore the signed-in user’s profile by fixing the authorization header on the profile request.',
    difficulty: 2,
    order: 2,
    route: '/dashboard/profile',
    icon: '◉',
    eyebrow: 'IDENTITY GATEWAY // TOKEN REJECTED',
    screenTitle: 'Profile data failed to hydrate',
    screenDescription: 'Your dashboard loaded, but the profile service cannot identify the signed-in user.',
    status: '401 UNAUTHORIZED',
    statusTone: 'danger',
    notice: 'Authorization header omitted. The request was dispatched anonymously.',
    request: {
      id: 'profile-request',
      method: 'GET',
      url: '/api/v2/users/me',
      status: 401,
      request: { headers: { Accept: 'application/json' } },
      response: { error: 'jwt_missing', message: 'Bearer token required in Authorization header.' },
      duration: 142
    },
    metrics: [{ label: 'AUTH HEADER', value: 'MISSING' }, { label: 'SESSION TOKEN', value: 'AVAILABLE' }],
    actionLabel: 'Retry profile query',
    interactionResult: 'The profile endpoint still rejects anonymous requests. Inspect the request interceptor.',
    console: 'Profile hydration failed: downstream identity gateway requires a Bearer token.',
    filePath: '/src/services/apiClient.ts',
    fileContent: `export function requestConfig() {
  return {
    headers: { 'Content-Type': 'application/json' }
  }
}

// Session token is available in sessionStorage.`,
    docsPath: '/docs/identity-gateway.md',
    docsContent: `# Identity Gateway v2

GET /api/v2/users/me

Every authenticated request must include:
Authorization: Bearer <session token>

Requests without a Bearer token receive 401 jwt_missing.`,
    inspected: {
      id: 'profile-view',
      tag: 'ProfileView',
      attributes: { endpoint: '/api/v2/users/me', authorization: 'required' },
      events: ['loadProfile()'],
      state: { profile: null, loading: false, error: 'jwt_missing' }
    },
    action: {
      id: 'profile-auth-header',
      target: 'profile.request.authorization',
      allowedValues: ['missing', 'Bearer session token'],
      expected: 'Bearer session token'
    },
    hints: [
      'The profile request reaches the gateway, but the gateway cannot tell who is asking.',
      'Inspect the request headers in Network and compare them with the identity gateway notes.',
      'Attach the session token using the Authorization: Bearer <token> header.'
    ]
  }),
  createCase({
    slug: 'wrong-data-right-user',
    title: 'Wrong Data, Right User',
    description: 'Scope the account cache to its tenant so the right user receives the right account state.',
    difficulty: 3,
    order: 3,
    route: '/accounts',
    icon: '▤',
    eyebrow: 'ACCOUNT SERVICE // STALE CACHE',
    screenTitle: 'Wrong data. Right user.',
    screenDescription: 'The request succeeds and the account page renders, but these balances belong to another tenant.',
    status: '200 OK · STALE DATA',
    statusTone: 'warning',
    notice: 'A shared cache entry returned account data from the wrong tenant.',
    request: {
      id: 'account-request',
      method: 'GET',
      url: '/api/v1/accounts/current',
      status: 200,
      request: { userId: 'alex-chen', tenantId: 'northstar' },
      response: { tenantId: 'apex-dynamics', accountName: 'Apex Operations', balance: 74200, cached: true },
      duration: 18
    },
    metrics: [{ label: 'SIGNED-IN TENANT', value: 'NORTHSTAR' }, { label: 'RETURNED TENANT', value: 'APEX' }],
    actionLabel: 'Refresh account data',
    interactionResult: 'The API returned 200, but the account still belongs to the wrong tenant.',
    console: 'Cache hit for account:current — tenant key missing; cached tenant "apex-dynamics".',
    filePath: '/src/cache/accountCache.ts',
    fileContent: `export function accountCacheKey(userId: string) {
  return \`account:\${userId}\`
}

export async function getAccount(user: User) {
  return cache.getOrLoad(
    accountCacheKey(user.id),
    () => api.getAccount(user.id)
  )
}`,
    docsPath: '/docs/multi-tenant-cache.md',
    docsContent: `# Multi-tenant account cache

Account responses are tenant-specific.
Cache keys must include both the tenant and user identifiers:

account:<tenantId>:<userId>

Never share one tenant's account result with another tenant.`,
    inspected: {
      id: 'account-summary',
      tag: 'AccountSummary',
      attributes: { 'data-user': 'alex-chen', 'data-tenant': 'northstar' },
      events: ['loadAccount()'],
      state: { displayedTenant: 'apex-dynamics', cacheHit: true }
    },
    action: {
      id: 'tenant-cache-scope',
      target: 'profile.cache.scope',
      allowedValues: ['global', 'tenant'],
      expected: 'tenant'
    },
    hints: [
      'A successful status code does not guarantee that the response belongs to this user.',
      'Compare the tenant in the request with the tenant in the response, then inspect the cache key.',
      'The account cache key must be scoped by tenant, not shared globally.'
    ]
  }),
  createCase({
    slug: 'dashboard-that-lies',
    title: 'The Dashboard That Lies',
    description: 'Normalize dashboard timestamps to UTC so daily totals match the source report.',
    difficulty: 3,
    order: 4,
    route: '/analytics/dashboard',
    icon: '⌁',
    eyebrow: 'ANALYTICS SERVICE // TOTALS DISAGREE',
    screenTitle: 'Yesterday’s numbers. Probably.',
    screenDescription: 'The dashboard loads, but its daily revenue does not match the verified source report.',
    status: 'DATA MISMATCH',
    statusTone: 'warning',
    notice: 'Local-time parsing shifted late-night events into the wrong reporting day.',
    request: {
      id: 'analytics-request',
      method: 'GET',
      url: '/api/v2/analytics/summary?range=today',
      status: 200,
      request: { range: 'today', timezone: 'UTC' },
      response: { dailyRevenue: 42810, sourceRevenue: 39240, lastEventAt: '2025-03-01T00:15:00Z' },
      duration: 96
    },
    metrics: [{ label: 'DASHBOARD TOTAL', value: '$42,810' }, { label: 'SOURCE REPORT', value: '$39,240' }],
    actionLabel: 'Reload analytics',
    interactionResult: 'The API is healthy. The displayed reporting window still uses local time.',
    console: 'Metric discrepancy: local date boundary includes events outside the UTC reporting day.',
    filePath: '/src/analytics/dateRange.ts',
    fileContent: `export function reportingDay(value: string) {
  const eventDate = new Date(value)
  return new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate()
  )
}`,
    docsPath: '/docs/analytics-reporting.md',
    docsContent: `# Analytics reporting windows

All daily billing and analytics boundaries use UTC.
The API returns ISO-8601 timestamps ending in Z.
Do not derive report dates from the browser's local timezone.`,
    inspected: {
      id: 'revenue-chart',
      tag: 'RevenueChart',
      attributes: { 'data-range': 'today', 'data-timezone': 'local' },
      events: ['loadDailySummary()'],
      state: { revenue: 42810, sourceRevenue: 39240 }
    },
    action: {
      id: 'analytics-timezone',
      target: 'dashboard.timestamp.mode',
      allowedValues: ['local', 'utc'],
      expected: 'utc'
    },
    hints: [
      'The API returned data successfully; the discrepancy begins when the dashboard groups it.',
      'Compare the ISO timestamp in Network with the reporting rule in the docs.',
      'Use UTC date boundaries instead of the browser’s local timezone.'
    ]
  }),
  createCase({
    slug: 'the-race',
    title: 'The Race',
    description: 'Prevent duplicate checkout submissions while the first asynchronous request is still in flight.',
    difficulty: 4,
    order: 5,
    route: '/checkout/review',
    icon: '↯',
    eyebrow: 'CHECKOUT GATEWAY // REQUEST COLLISION',
    screenTitle: 'Two clicks. Two charges.',
    screenDescription: 'A slow confirmation lets a second submit race the first request.',
    status: '409 CONFLICT',
    statusTone: 'danger',
    notice: 'Duplicate checkout requests attempted to reserve the same order.',
    request: {
      id: 'checkout-request',
      method: 'POST',
      url: '/api/v1/checkout/commit',
      status: 409,
      request: { orderId: 'ord-1042', idempotencyKey: null },
      response: { error: 'duplicate_submission', firstRequest: 'processing', secondRequest: 'rejected' },
      duration: 1200
    },
    metrics: [{ label: 'IN-FLIGHT REQUESTS', value: '02' }, { label: 'ORDER STATE', value: 'CONFLICT' }],
    actionLabel: 'Retry checkout',
    interactionResult: 'A second request raced the pending checkout. Guard the submit action while it is in flight.',
    console: 'Warning: submitCheckout dispatched again before the first promise settled.',
    filePath: '/src/checkout/CheckoutForm.vue',
    fileContent: `<script setup>
async function submitCheckout() {
  const result = await checkout.commit(order.value)
  confirmation.value = result
}
</script>

<button @click="submitCheckout">Place order</button>`,
    docsPath: '/docs/checkout-reliability.md',
    docsContent: `# Checkout reliability

Disable the submit control while a checkout request is pending.
Restore it in a finally block after the request settles.
The gateway rejects overlapping commits for the same order.`,
    inspected: {
      id: 'checkout-submit',
      tag: 'button',
      attributes: { type: 'submit', disabled: 'false' },
      events: ['click → submitCheckout()'],
      state: { isSubmitting: false, pendingRequests: 1 }
    },
    action: {
      id: 'checkout-submit-guard',
      target: 'checkout.request.guard',
      allowedValues: ['none', 'disable-while-pending'],
      expected: 'disable-while-pending'
    },
    hints: [
      'The failure is intermittent because the first request is still working when another begins.',
      'Look for duplicate POSTs in Network, then inspect how the submit button handles pending work.',
      'Disable the submit action until the first checkout promise settles.'
    ]
  }),
  createCase({
    slug: 'production-launch',
    title: 'Production',
    description: 'Stabilize the launch by fixing authentication, analytics time boundaries, and duplicate checkout submissions.',
    difficulty: 5,
    order: 6,
    route: '/launch/control-room',
    icon: '⚡',
    eyebrow: 'PRODUCTION LAUNCH // FINAL INCIDENT',
    screenTitle: 'All systems must hold',
    screenDescription: 'The release candidate is green on paper, but three cross-service regressions threaten launch.',
    status: '2 / 5 SYSTEMS STABLE',
    statusTone: 'warning',
    notice: 'Authentication, revenue rollups, and checkout concurrency still need verified patches.',
    request: {
      id: 'launch-health',
      method: 'GET',
      url: '/api/v1/production/health',
      status: 200,
      request: { release: 'v1.0.0-rc', region: 'us-east' },
      response: { auth: 'degraded', analytics: 'degraded', checkout: 'degraded', database: 'healthy', queue: 'healthy' },
      duration: 87
    },
    metrics: [{ label: 'RELEASE CANDIDATE', value: 'V1.0.0-RC' }, { label: 'SYSTEM INTEGRITY', value: 'AT RISK' }],
    actionLabel: 'Run launch verification',
    interactionResult: 'Production checks found three regressions. Correlate their clues across the tools and stage every fix.',
    console: 'Launch blocked: auth payload mismatch; analytics UTC window drift; checkout duplicate commit.',
    filePath: '/src/release/hotfixes.ts',
    fileContent: `export const releaseHotfixes = {
  authIdentifier: 'username',
  analyticsTimezone: 'local',
  checkoutGuard: 'none'
}`,
    docsPath: '/docs/launch-checklist.md',
    docsContent: `# Production launch checklist

- Authentication payload uses the gateway's "email" contract.
- Daily analytics are grouped in UTC.
- Checkout submit is locked during an in-flight commit.
- Verify each subsystem before deploying the release candidate.`,
    inspected: {
      id: 'launch-health-panel',
      tag: 'LaunchHealthPanel',
      attributes: { release: 'v1.0.0-rc', 'data-target': 'production' },
      events: ['runLaunchChecks()'],
      state: { auth: 'degraded', analytics: 'degraded', checkout: 'degraded' }
    },
    action: {
      id: 'launch-auth-identifier',
      target: 'launch.auth.identifier',
      allowedValues: ['username', 'email'],
      expected: 'email'
    },
    hints: [
      'The health endpoint is up; inspect which individual systems are marked degraded.',
      'Use Console, Network, and the release files to compare the three failing contracts.',
      'Stage all three fixes: use email for auth, UTC for analytics, and guard checkout while pending.'
    ]
  })
]

const launchCase = caseDefinitions[5]
launchCase.content.actions.push(
  { id: 'launch-analytics-timezone', type: 'modify', target: 'launch.analytics.timezone', allowedValues: ['local', 'utc'] },
  { id: 'launch-checkout-guard', type: 'modify', target: 'launch.checkout.guard', allowedValues: ['none', 'disable-while-pending'] }
)
launchCase.content.solution.requiredChanges.push(
  { target: 'launch.analytics.timezone', value: 'utc' },
  { target: 'launch.checkout.guard', value: 'disable-while-pending' }
)
