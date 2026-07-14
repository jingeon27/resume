# 블로그 수정본 안내

공개 글을 바로 덮어쓰기 전에 검토할 수 있도록 수정본을 별도 파일로 정리했다.

## 이번 판단에서 바로잡은 부분

- 19번 글은 Next.js 인증 가이드와 다른 문제를 다룬다. HttpOnly 쿠키를 그대로 공유하는 방식이 아니라, 서로 다른 호스트 사이에서 인증 정보를 한 번 넘겨야 하는 제약에 대한 글이다. 따라서 "가이드 위반"이라고 단정할 수 없다. 다만 설계 논점과 별개로 회사 실명(`세이프닥`, `safedoc-hospital-admin`)이 본문에 그대로 노출되어 있어 익명화가 필요했고, 수정본을 만들었다. 익명화와 함께 본문이 말만 하던 Origin 검증을 코드로 추가하고, CSP를 `unsafe-inline`에서 nonce 기반으로 바꾸고, refresh token까지 위임하는 구조의 트레이드오프와 "history는 안전" 단정의 한정도 반영했다.
- 20번 글은 공개해도 된다는 판단을 유지한다. 다만 제목의 "다섯 번"과 본문 6단계 카운트의 기준(0장은 출발점), drain-only 펌프 판단의 관찰 근거, async generator 브리지의 notify 한계 각주를 보강한 수정본을 추가했다.
- 12번 Optimistic Update 글도 수정 대상에 포함했다. 자동 롤백이라는 잘못된 설명을 제거하고, 목록·상세 캐시 snapshot을 `onMutate`에서 반환해 `onError`에서 직접 복구하는 흐름으로 다시 작성했다.
- 21번 글은 유지한다. 다만 현재 구현에 맞춰 인증 정책을 "서버에서는 토큰을 읽지 않는다"가 아니라 "공개 조회는 기본적으로 쿠키를 읽지 않고, 회원별 SSR 조회만 명시적으로 허용한다"로 표현했다.

## 파일 목록

| 공개 글 | 수정본 | 방향 |
| --- | --- | --- |
| 4 | `post-04-puppeteer-closure.md` | listener 정리, timeout, falsy 값 처리까지 포함해 재작성 |
| 5 | `post-05-electron-nestjs-inspired.md` | NestJS 사용이 아니라 아키텍처 참고로 명확화 |
| 6 | `post-06-query-key-factory.md` | 버전과 API를 정확히 명시하고 예제 수정 |
| 7 | `post-07-typescript-patterns.md` | 오타와 개념 오류를 고치고 XOR props로 교체 |
| 8 | `post-08-next-tanstack-query.md` | QueryClient 생성 조건과 병렬 prefetch 수정 |
| 11 | `post-11-reservation-form.md` | 대표 글 후보, 상태 소스 단일화에 집중 |
| 12 | `post-12-review-like-optimistic-update.md` | 캐시 snapshot, 직접 rollback, 동시성 한계를 반영 |
| 14 | `post-14-next-seo-prefetch.md` | `await`와 pending dehydration을 구분해 재작성 |
| 15 | `post-15-review-form.md` | 근거 없는 수치를 빼고 스키마 조합을 수정 |
| 18 | `post-18-program-form.md` | 타입 폼, Transfer Layer, 동기화 경계를 보강 |
| 19 | `post-19-cross-domain-token.md` | 회사 실명 익명화, Origin 검증 코드·nonce CSP·refresh token 트레이드오프 반영 |
| 20 | `post-20-chatbot-message-layer.md` | "다섯 번" 카운트 기준 명시, drain-only 관찰 근거·notify 각주 보강, 문체 다듬기 |
| 21 | `post-21-sitemap-cache.md` | 현재 인증 정책과 sitemap 한계를 반영 |
| 22 | `post-22-payment-coupon.md` | union/OCP 과장 대신 실제 분기 집중화로 수정 |
| 23 | `post-23-fsd-2-1.md` | 공식 원칙과 개인 적용 기준을 분리하고 축약 |
| 24 | `post-24-prototype-rules.md` | hook/props/Suspense의 blanket rule을 제거 |

## 발행 순서

1. 19번을 가장 먼저 교체한다. 공개 글에 회사 실명이 그대로 남아 있어 다른 어떤 글보다 시급하다. 5번도 공개 글에 채용 플랫폼 실명이 남아 있으므로 같은 이유로 함께 교체한다.
2. 8, 12, 15, 22번을 교체한다. 기술 정확성과 직접 맞닿아 있다.
3. 11, 18, 20, 21, 23, 24번을 대표 글로 다듬어 공개한다.
4. 4, 6, 7, 14번은 새 수정본으로 교체하되, 블로그 첫 화면에서는 대표 글 뒤로 배치한다.
