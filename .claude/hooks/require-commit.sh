#!/bin/bash
# Stop 훅 — AGENTS.md 1행 "파일 변경할 때마다 커밋해야한다" 를 강제한다.
# 워킹트리에 커밋 안 된 변경이 남아 있으면 종료를 막고, 커밋하라고 되돌려 보낸다.
# 자동 커밋이 아니라 되돌려 보내는 건 메시지를 이 레포 형식(`docs: ...`)으로 쓰게 하려는 것이다.
input=$(cat)

# 한 번 되돌려 보낸 뒤의 종료는 통과시킨다 — 커밋이 막히는 상황에서 무한 루프를 돌지 않게.
[ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false')" = "true" ] && exit 0

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0
changes=$(git status --porcelain)
[ -z "$changes" ] && exit 0

jq -n --arg files "$(printf '%s\n' "$changes" | head -20)" '{
  decision: "block",
  reason: ("커밋 안 된 변경이 남아 있다 (AGENTS.md: 파일 변경할 때마다 커밋해야한다). 변경을 확인하고 이 레포 형식(`docs: ...` 한국어 제목)으로 커밋한 뒤 끝낸다.\n" + $files)
}'
