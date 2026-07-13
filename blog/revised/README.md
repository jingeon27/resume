# 블로그 수정본 안내

공개 글을 바로 덮어쓰기 전에 검토할 수 있도록 수정본을 별도 파일로 정리했다.

## 이번 판단에서 바로잡은 부분

- 19번 글은 Next.js 인증 가이드와 다른 문제를 다룬다. HttpOnly 쿠키를 그대로 공유하는 방식이 아니라, 서로 다른 호스트 사이에서 인증 정보를 한 번 넘겨야 하는 제약에 대한 글이다. 따라서 "가이드 위반"이라고 단정할 수 없다. 다만 전달 순간에는 토큰이 HTML에 포함되므로, HttpOnly의 보호 범위가 그 구간까지 유지되는 것은 아니라는 잔여 위험을 글에 명시하는 편이 정확하다.
- 20번 글은 공개해도 된다는 판단을 반영해 이번 수정 대상에서 제외했다.
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
| 21 | `post-21-sitemap-cache.md` | 현재 인증 정책과 sitemap 한계를 반영 |
| 22 | `post-22-payment-coupon.md` | union/OCP 과장 대신 실제 분기 집중화로 수정 |
| 23 | `post-23-fsd-2-1.md` | 공식 원칙과 개인 적용 기준을 분리하고 축약 |
| 24 | `post-24-prototype-rules.md` | hook/props/Suspense의 blanket rule을 제거 |

## 발행 순서

1. 8, 12, 15, 22번을 먼저 교체한다. 기술 정확성과 직접 맞닿아 있다.
2. 11, 18, 21, 23, 24번을 대표 글로 다듬어 공개한다.
3. 4, 5, 6, 7, 14번은 새 수정본으로 교체하되, 블로그 첫 화면에서는 대표 글 뒤로 배치한다.
