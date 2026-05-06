# Local Figma MCP 연결 가이드

Claude Code에서 로컬 Figma Dev Mode MCP 서버에 붙여, 데스크톱 앱으로 열어둔 Figma 파일을 직접 조회/추출하기 위한 설정 문서.

## TL;DR

- Claude 로그인 계정과 Figma 로그인 계정은 **전혀 무관**하다.
- Figma 데스크톱 앱에서 Dev Mode MCP 서버를 켜면 `http://127.0.0.1:3845`에 로컬 서버가 뜬다.
- Claude Code에 그 로컬 엔드포인트를 MCP 서버로 등록한다.
- 파일 권한은 **Figma 데스크톱에 로그인된 계정**으로 판정된다.

## 계정 관계 정리

| 항목 | 사용 계정 | 역할 |
| --- | --- | --- |
| Claude Code 로그인 | `nadogive2026@gmail.com` | Claude Code 사용 인증 |
| Figma 데스크톱 로그인 | `newfly101@gmail.com` | Figma 파일 접근 권한 판정 |
| MCP 통신 채널 | `127.0.0.1:3845` (localhost) | 두 앱이 내 PC 안에서만 통신 |

→ 두 계정이 달라도 동작한다. Figma 파일에 대한 권한은 오직 데스크톱에 로그인된 Figma 계정 기준이다.

## 사전 준비

1. **Figma 데스크톱 앱 설치**
   - 브라우저 버전은 로컬 MCP 서버를 띄울 수 없다. 반드시 데스크톱 앱이어야 한다.
2. **권한 있는 계정으로 로그인**
   - 이 프로젝트에서는 `newfly101@gmail.com`으로 로그인.
   - 작업 대상 파일(`figma.com/design/VCVQzOpSIpwpZw11gxG7N1/...`)이 해당 계정 또는 공유 권한에 포함되어 있어야 한다.
3. **유료 플랜 확인**
   - Dev Mode MCP Server는 Figma Professional/Organization/Enterprise 플랜의 Dev 또는 Full seat에서만 활성화된다.
   - Free/Starter 계정은 메뉴 자체가 보이지 않을 수 있다.

## 1단계: Figma에서 Dev Mode MCP 서버 켜기

1. Figma 데스크톱 앱 실행.
2. 상단 메뉴 → `Figma` → `Preferences`.
3. **`Enable local MCP server`** (또는 `Enable Dev Mode MCP Server`) 항목 체크.
4. "Server enabled" 토스트가 뜨면 정상. `http://127.0.0.1:3845/sse` 엔드포인트가 열린 상태.

> 켠 뒤에는 데스크톱 앱을 종료하지 말 것. 종료하면 로컬 서버도 같이 내려간다.

## 2단계: Claude Code에 MCP 등록

기존에 등록된 원격(=실패 중인) Figma 항목이 있다면 먼저 정리.

```powershell
# 현재 등록 상태 확인
claude mcp list

# (필요 시) 기존 항목 제거
claude mcp remove "claude.ai 피그마"
```

로컬 SSE 서버로 새 MCP 등록.

```powershell
claude mcp add --transport sse figma-dev-mode http://127.0.0.1:3845/sse
```

스코프 옵션:

- 기본(local) — 이 프로젝트 + 내 계정 전용. 이 프로젝트에서만 쓸 거면 권장.
- `-s user` — 내 모든 프로젝트에서 쓰고 싶을 때.
- `-s project` — `.mcp.json`에 기록되어 git으로 팀원과 공유. 이 케이스에서는 비추천(타인은 다른 Figma 계정/플랜일 수 있음).

## 3단계: 연결 확인

```powershell
claude mcp list
```

`figma-dev-mode: http://127.0.0.1:3845/sse - ✓ Connected` 형태면 OK. `Failed to connect`이면:

- Figma 데스크톱 앱이 실행 중인지
- Preferences에서 MCP 서버가 켜져 있는지
- 다른 프로세스가 3845 포트를 점유 중인지 (`Get-NetTCPConnection -LocalPort 3845`)

## 4단계: 사용

1. Figma 데스크톱 앱에서 작업할 파일을 연다.
   - 본 프로젝트 대상 파일: `https://www.figma.com/design/VCVQzOpSIpwpZw11gxG7N1/%EC%BB%B4%ED%94%84%EC%95%BC%ED%8E%80?node-id=101-5455`
2. 추출하고 싶은 프레임/노드를 캔버스에서 **선택**한다.
3. Claude Code 프롬프트에서 그 선택 영역에 대한 작업을 지시한다(예: "현재 선택된 프레임을 React 컴포넌트로 변환해줘").
   - URL을 같이 붙여넣어 노드 ID를 명시해도 된다(`?node-id=101-5455`).

## 트러블슈팅

| 증상 | 원인/해결 |
| --- | --- |
| `Failed to connect` | Figma 데스크톱 미실행 또는 MCP 서버 OFF |
| Preferences에 MCP 항목 자체가 없음 | 무료/Starter 플랜이거나 Dev seat 권한 없음 |
| 파일은 열리는데 노드 데이터를 못 가져옴 | 선택된 노드가 없음. 캔버스에서 프레임/컴포넌트 선택 후 재시도 |
| 회사 SSO Figma 계정 자료에 접근 안 됨 | 데스크톱에 로그인된 계정이 그 워크스페이스 멤버가 아님. 계정 전환 또는 파일 공유 필요 |
| 포트 3845 충돌 | 다른 Figma 인스턴스/프록시 점유. 해당 프로세스 종료 |

## 보안 메모

- 로컬 MCP 서버는 외부에 노출되지 않는 `127.0.0.1` 바인딩이지만, 활성화된 동안에는 같은 PC의 다른 프로세스가 접근 가능하다. 사용 후에는 Preferences에서 끄거나 Figma 데스크톱을 종료해 두는 것이 안전하다.
- `-s project` 스코프로 등록하면 `.mcp.json`이 커밋되어 팀원에게도 노출된다. 로컬 전용 설정은 `-s local`(기본)을 유지할 것.
