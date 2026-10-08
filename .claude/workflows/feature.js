export const meta = {
  name: 'feature',
  description: '기능 하나를 drafts → 분석 → FE∥BE 개발 → 통합·Playwright 실측 → 수정 루프 → 문서 검사까지 자동으로 끝낸다',
  whenToUse: '/feature <기능> 으로 호출. 사용자가 drafts/<branch>/ 에 창작물을 넣고 시작 지시를 내린 뒤',
  phases: [
    { title: '분석', detail: 'drafts + 현재 spec → analysis.md · spec-delta.md · 작업 명세' },
    { title: '개발', detail: 'FE · BE 동시. 각자 history.md 항목까지' },
    { title: '통합·실측', detail: 'Playwright 로 화면 실측 → must 항목은 되돌려 수정 (최대 N회)' },
    { title: '문서·검사', detail: '생성 스크립트 · docs-check · 버전 동기' },
  ],
}

// ---------- 입력 ----------
// args: { feature, branch, drafts, root, fePort, bePort, date, maxFixRounds }
const A = args || {}
const feature = A.feature
const branch = A.branch
const drafts = A.drafts            // 절대경로. 사람 창작물 폴더
const root = A.root || '.'
const fePort = A.fePort || 3000
const bePort = A.bePort || 8080
const today = A.date || '날짜 미지정'
const MAX_FIX = A.maxFixRounds || 3
// 비용: 워크플로 agent 는 모델을 안 적으면 메인 세션 모델(Fable)을 쓴다. 전부 sonnet 고정 — 사용자 결정 2026-09-29
const MODEL = A.model || 'sonnet'
// 사용자가 이미 내린 결정: [{ kind: 'db-ddl', decision: '...' }]. 같은 kind 의 blocker 는 다시 올리지 않는다
const decisions = Array.isArray(A.decisions) ? A.decisions : []
if (!feature || !branch) throw new Error('args.feature 와 args.branch 가 필요하다')

const progress = `.claude/.progress/${branch}`
const featDocs = `docs/features/${feature}`
const decided = decisions.length
  ? ` 사용자가 이미 결정한 것(그대로 따르고 blockers 로 다시 올리지 않는다, 원문 ${drafts}/decision.md): ${decisions.map(d => `[${d.kind}] ${d.decision}`).join(' / ')}.`
  : ''
const common = `기능 ${feature} · 브랜치 ${branch} · 오늘 ${today}. 작업 문서 폴더 ${progress}/ (없으면 만든다). 사람 창작물은 ${drafts}/ (절대경로, 링크 아님). 이 기능의 정본 문서는 ${featDocs}/{spec,design,history}.md.${decided}`

// ---------- 스키마 ----------
const ANALYSIS = {
  type: 'object',
  properties: {
    needsFE: { type: 'boolean' }, needsBE: { type: 'boolean' },
    analysisPath: { type: 'string' }, specDeltaPath: { type: 'string' },
    feTasks: { type: 'array', items: { type: 'string' } },
    beTasks: { type: 'array', items: { type: 'string' } },
    blockers: { type: 'array', items: { type: 'object', properties: { kind: { type: 'string' }, desc: { type: 'string' } }, required: ['kind', 'desc'] } },
    summary: { type: 'string' },
    analysisMd: { type: 'string' }, specDeltaMd: { type: 'string' },
  },
  required: ['needsFE', 'needsBE', 'analysisPath', 'blockers', 'summary'],
}
const DEV = {
  type: 'object',
  properties: {
    done: { type: 'boolean' },
    files: { type: 'array', items: { type: 'string' } },
    historyEntryWritten: { type: 'boolean' },
    unresolved: { type: 'array', items: { type: 'string' } },
    buildCommand: { type: 'string' }, buildOk: { type: 'boolean' },
  },
  required: ['done', 'files', 'historyEntryWritten', 'unresolved'],
}
const VERIFY = {
  type: 'object',
  properties: {
    pass: { type: 'boolean' },
    verificationPath: { type: 'string' },
    findings: { type: 'array', items: { type: 'object', properties: {
      severity: { type: 'string', enum: ['must', 'should'] },
      area: { type: 'string', enum: ['FE', 'BE', 'docs'] },
      desc: { type: 'string' }, file: { type: 'string' },
    }, required: ['severity', 'area', 'desc'] } },
    screens: { type: 'array', items: { type: 'string' } },
  },
  required: ['pass', 'findings'],
}
const DOCS = {
  type: 'object',
  properties: { ok: { type: 'boolean' }, violations: { type: 'array', items: { type: 'string' } }, specVersion: { type: 'string' } },
  required: ['ok', 'violations'],
}

// ---------- 1. 분석 ----------
phase('분석')
const analysis = await agent(
`${common}
developer-analyze 역할. 입력: ${drafts}/ 의 모든 파일(html·md·xlsx 이름과 내용), 현재 ${featDocs}/spec.md·design.md(없으면 신규 기능 — .claude/templates/spec.md·design.md 로 초안을 ${progress}/ 에 만든다), 관련 코드.
산출: ${progress}/analysis.md (템플릿 .claude/templates/analysis.md + 기능 분해 §), ${progress}/spec-delta.md (spec/design 에서 바뀔 § 만 "대상 파일 · § · 바뀐 뒤 본문"), ${progress}/decisions.log.
🔴 항목(DB DDL — test DB = prod DB · 법무 문구 · 권한 모델 변경 · 외부 자산 도입 · 운영 배포)은 가정값으로 진행하지 말고 blockers 에 넣는다. 🟨·❓ 는 가정값으로 진행하고 decisions.log 에 남긴다.
반환: needsFE/needsBE, feTasks/beTasks(각 1줄, analysis.md 의 § 3/§ 4 항목 번호 포함), blockers, summary(3줄).
analysis.md·spec-delta.md 는 파일로 쓰지 말고 본문 전체를 analysisMd·specDeltaMd 로 반환한다 (서브에이전트는 보고서 파일 쓰기가 막혀 있다 — 메인 세션이 대신 쓴다). decisions.log 는 평소대로 쓴다.`,
  { label: `analyze:${feature}`, phase: '분석', model: MODEL, agentType: 'developer-analyze', schema: ANALYSIS })
if (!analysis) throw new Error('분석 agent 가 결과를 내지 못했다')
// 이미 결정된 kind 는 정지선에서 제외한다
if (!args.analysisWritten) {
  return { status: 'needs-write', stage: '분석', analysisPath: analysis.analysisPath, specDeltaPath: analysis.specDeltaPath, analysisMd: analysis.analysisMd, specDeltaMd: analysis.specDeltaMd, blockers: analysis.blockers, summary: analysis.summary }
}
const openBlockers = analysis.blockers.filter(b => !decisions.some(d => d.kind === b.kind))
log(`분석 완료 — FE ${analysis.needsFE ? '필요' : '없음'} · BE ${analysis.needsBE ? '필요' : '없음'} · 🔴 ${openBlockers.length}건 (결정됨 ${analysis.blockers.length - openBlockers.length})`)
if (openBlockers.length) {
  return { status: 'blocked', stage: '분석', blockers: openBlockers, analysisPath: analysis.analysisPath, summary: analysis.summary }
}

// ---------- 2. 개발 (FE ∥ BE) ----------
phase('개발')
const devPrompt = side => `${common}
${side === 'FE' ? 'frontend-developer' : 'backend-developer'} 역할. 입력: ${analysis.analysisPath} 의 ${side === 'FE' ? '§ 4 FE 작업 명세' : '§ 3 BE 작업 명세'} 만. 명세 항목: ${(side === 'FE' ? analysis.feTasks : analysis.beTasks || []).join(' / ')}.
${side === 'FE' ? 'dev 서버는 포트 ' + fePort + ' (npx vite --port ' + fePort + '). BE 는 손대지 않는다.' : 'dev 서버는 포트 ' + bePort + ' (./gradlew bootRun --args="--server.port=' + bePort + '"). FE 와 sql/ DDL 은 손대지 않는다.'}
끝낼 때 반드시: ① 빌드 통과(${side === 'FE' ? 'npm run build' : './gradlew compileJava'}) ② ${featDocs}/history.md 맨 위에 .claude/templates/history-entry.md 형식 항목 1개(버전은 PATCH/MINOR 판단, 근거 커밋은 "미커밋" 으로 두고 메인이 채운다) ③ 같은 오류 3회면 [미결] 로 표시하고 다음 항목.
커밋·브랜치 변경·git checkout 금지. 반환: done, files(고친 경로), historyEntryWritten, unresolved, buildCommand, buildOk.`

const devResults = await parallel([
  ...(analysis.needsFE ? [() => agent(devPrompt('FE'), { label: `FE:${feature}`, phase: '개발', model: MODEL, agentType: 'frontend-developer', schema: DEV })] : []),
  ...(analysis.needsBE ? [() => agent(devPrompt('BE'), { label: `BE:${feature}`, phase: '개발', model: MODEL, agentType: 'backend-developer', schema: DEV })] : []),
])
const dev = devResults.filter(Boolean)
const changedFiles = dev.flatMap(d => d.files)
const unresolved = dev.flatMap(d => d.unresolved)
log(`개발 완료 — 파일 ${changedFiles.length}개 · 미결 ${unresolved.length}건 · 빌드 ${dev.every(d => d.buildOk !== false) ? 'OK' : '실패 있음'}`)

// ---------- 3. 통합·실측 → 수정 루프 ----------
phase('통합·실측')
let verify = null
let round = 0
let openFindings = []
while (round < MAX_FIX) {
  round++
  verify = await agent(
`${common}
developer-integrate 역할. 라운드 ${round}/${MAX_FIX}. 입력: ${analysis.analysisPath}, ${progress}/spec-delta.md, 고쳐진 파일 ${JSON.stringify(changedFiles)}, 이전 라운드 미해결 ${JSON.stringify(openFindings)}.
할 일: ① FE·BE 정합(응답 형태·경로·상태코드) 대조 ② dev 서버가 떠 있지 않으면 띄운다(FE ${fePort} · BE ${bePort}) ③ Playwright MCP 로 이 기능의 화면 전부를 폭 480 으로 열어 스냅샷·콘솔 오류·빈 화면·불러오는 중 고착·오류 상태를 확인하고 캡처를 ${progress}/shots/ 에 저장 ④ spec-delta 를 ${featDocs}/spec.md·design.md 에 반영하고 spec 의 version 을 history.md 최상단 버전과 맞춘다 ⑤ ${progress}/verification.md 작성(템플릿 .claude/templates/verification.md, 마지막 § 는 history-entry 블록).
findings: 이용자가 겪을 문제·정합 깨짐·콘솔 오류는 must, 다듬기는 should. 코드는 직접 고치지 않는다(권고만). 커밋·git checkout 금지.
반환: pass(must 0건이면 true), verificationPath, findings, screens(확인한 화면 경로).`,
    { label: `verify#${round}:${feature}`, phase: '통합·실측', model: MODEL, agentType: 'developer-integrate', schema: VERIFY })
  if (!verify) throw new Error('통합 agent 가 결과를 내지 못했다')
  const must = verify.findings.filter(f => f.severity === 'must')
  log(`실측 ${round}회 — must ${must.length} · should ${verify.findings.length - must.length}`)
  if (verify.pass || must.length === 0) { openFindings = verify.findings; break }
  if (round === MAX_FIX) { openFindings = verify.findings; log(`수정 루프 상한 ${MAX_FIX}회 도달 — must ${must.length}건 미해결 상태로 사용자에게 넘긴다`); break }

  // must 를 영역별로 되돌려 고친다 (FE ∥ BE)
  const byArea = area => must.filter(f => f.area === area)
  const fixes = await parallel(['FE', 'BE'].filter(a => byArea(a).length).map(a => () => agent(
`${common}
${a === 'FE' ? 'frontend-developer' : 'backend-developer'} 역할 — 수정 라운드 ${round}. 실측에서 나온 must 항목만 고친다: ${JSON.stringify(byArea(a))}. 다른 영역·기능은 손대지 않는다. 고친 뒤 빌드 통과 확인, ${featDocs}/history.md 최상단 항목의 "고친 것" 에 1줄씩 추가(새 항목 만들지 않는다). 커밋·git checkout 금지.
반환: done, files, historyEntryWritten(true), unresolved, buildOk.`,
    { label: `fix#${round}:${a}`, phase: '통합·실측', model: MODEL, agentType: a === 'FE' ? 'frontend-developer' : 'backend-developer', schema: DEV })))
  fixes.filter(Boolean).forEach(f => { changedFiles.push(...f.files); unresolved.push(...f.unresolved) })
}

// ---------- 4. 문서·검사 ----------
phase('문서·검사')
const docs = await agent(
`${common}
저장소 루트에서 순서대로 실행하고 결과를 그대로 읽는다: python .claude/scripts/build-traceability.py → python .claude/scripts/build-readme-table.py → python .claude/scripts/docs-check.py.
추가 확인: ${featDocs}/history.md 최상단 항목이 오늘 날짜이고 "고친 것" 이 비어 있지 않은가 · spec.md 의 version 과 history 최상단 버전이 같은가 · CHANGELOG.md [Unreleased] 에 이 기능 1줄이 있는가(없으면 Fixed/Added/Changed 중 맞는 절에 이용자 관점 1줄 추가) · ${drafts}/ 를 삭제한다(흡수 끝).
위반이 있으면 문서 파일만 고쳐서 docs-check 가 0건이 될 때까지(최대 2회). 코드·커밋·git 금지.
반환: ok, violations(남은 것), specVersion.`,
  { label: `docs:${feature}`, phase: '문서·검사', model: MODEL, agentType: 'general-purpose', effort: 'low', schema: DOCS })

return {
  status: openFindings.some(f => f.severity === 'must') ? 'needs-attention' : 'ready-for-self-test',
  feature, branch, rounds: round,
  changedFiles: [...new Set(changedFiles)],
  unresolved, findings: openFindings,
  verificationPath: verify && verify.verificationPath,
  screens: verify && verify.screens,
  docs,
  ports: { fe: fePort, be: bePort },
}
