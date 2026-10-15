# 사이트맵에 올린 페이지가 전부 홈을 가리키고 있었어요: 크롤러 눈으로 복지몰 다시 보기

사이트맵에 검색 결과 주소를 수백 개 올려 두었는데, 그 페이지 하나를 열어 `<head>`를 보니 canonical이 홈 주소였어요. 브라우저로 볼 때는 아무 문제가 없었어요. 목록도 잘 뜨고 제목도 바뀌었으니까요. 그런데 검색엔진이 받는 문서는 "이 페이지의 원본은 홈입니다"라고 말하고 있었어요.

그때부터 복지몰을 사람 대신 크롤러 입장에서 다시 읽어 봤어요. JS를 실행하지 않고 서버가 처음 보낸 HTML만 보고, 링크를 따라가고, `<head>`에 무엇이 있는지 확인하는 식으로요. 고칠 게 생각보다 많았어요.

<div class="note note-summary">
  <strong>이 글에서 다루는 것</strong>
  <p>상속된 canonical이 하위 페이지를 홈으로 접던 문제, 상세 페이지 사이에 링크가 없던 문제, 페이지를 설명하지 못하던 제목과 구조화 데이터, 색인 범위를 다시 정한 과정, 그리고 JS를 실행하지 않는 봇이 받는 HTML에 목록과 메타데이터가 빠져 있던 문제를 차례로 다뤄요.</p>
</div>

## canonical 하나가 하위 페이지를 전부 홈으로 접고 있었어요

원인은 루트 layout이었어요.

```ts
// app/layout.tsx (고치기 전)
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};
```

Next.js의 metadata는 하위 라우트가 정의하지 않은 필드를 상위에서 물려받아요. 그래서 자기 canonical을 선언하지 않은 라우트는 전부 홈을 canonical로 내보냈어요. 검색 결과 페이지가 딱 그랬어요. 사이트맵으로 "이 주소를 색인해 주세요"라고 제출하면서, 문서 안에서는 "원본은 홈"이라고 말하는 셈이었죠.

사실 비슷한 일을 한 번 겪은 적이 있었어요. 그때는 전역 스크립트에 홈으로 고정된 canonical이 하드코딩돼 있어서 병원 상세와 시술 상세가 전부 홈으로 접혀 있었어요. 그걸 걷어내고 상세 페이지에 자기 자신을 가리키는 canonical을 붙였는데, 이번에는 같은 문제가 metadata 상속이라는 다른 경로로 남아 있었던 거예요.

고친 방향은 단순해요. layout에서 `alternates`를 지우고, 각 페이지가 자기 canonical을 직접 선언하게 했어요. 단일 언어 사이트인데 모든 페이지가 홈을 한국어 대체 URL로 가리키던 hreflang도 같이 지웠어요.

검색 결과 페이지는 주소에 필터가 많이 붙어요. 지역, 정렬, 혜택 필터까지 canonical에 넣으면 같은 목록이 수많은 주소로 쪼개지니, 시술 식별자와 탭만 남기고 나머지는 잘라 canonical을 만들었어요. 검색어 없이 들어온 검색 화면은 빈 결과라 `noindex, follow`로 내보냈어요.

## 상세 페이지로 들어가는 링크가 없었어요

canonical을 고치고 나서 크롤러로 사이트를 돌려 봤어요. 병원 상세와 시술 상세에서 다른 상세로 나가는 링크가 0개였어요. 홈에서 링크된 상세는 29개뿐이었고, 나머지 5,011개는 사이트맵 말고는 닿는 길이 없었어요.

카드들이 `<a>` 대신 `div`에 `onClick`과 `router.push`를 달고 있었기 때문이에요. 사람은 눌러서 이동하니 차이를 못 느끼지만, 크롤러에게는 링크가 없는 문서예요.

카드를 `Link`로 바꾸는 데서 걸린 건 카드 안의 버튼이었어요. 카드 전체를 `<a>`로 감싸면 버튼이 링크 안에 들어가서 마크업이 깨져요. 그래서 버튼이 들어 있는 카드는 병원 이름이나 시술 이름만 링크로 만들고, 부모의 `onClick`과 목적지가 같으니 `stopPropagation`으로 이동이 두 번 일어나지 않게 막았어요. 버튼이 없는 카드 스와이퍼는 카드 전체를 링크로 감쌌고, 호출하는 쪽에 남아 있던 `router.push`는 히스토리가 두 번 쌓이지 않게 걷어냈어요. 트래킹 콜백은 그대로 뒀어요.

건강검진 시술의 "검사 항목 보기"도 같은 경우였어요. 버튼의 `router.push`로만 들어가는 화면이라 주소가 문서 어디에도 없었어요. `Link`로 바꾸고, 그 화면에 제목과 설명, canonical, 구조화 데이터를 붙여 사이트맵에도 올렸어요.

## 제목과 설명이 페이지를 설명하지 못했어요

다음으로 본 건 검색 결과에 실제로 보일 문구였어요. 시술 상세의 description은 병원 이름 한 단어, 8자였어요. 병원 상세의 제목은 병원 이름 다섯 글자뿐이라 그 이름을 정확히 아는 사람만 찾아올 수 있었어요. 같은 분야의 다른 서비스들은 같은 자리에 제목 28~50자, 설명 45~102자 정도를 쓰고 있었어요.

- 병원 상세는 `{병원명} 후기·가격 | 서비스명` 형태로 바꾸고, description 맨 앞에 가까운 역 이름을 세웠어요. "강남역 치과"처럼 역으로 병원을 찾는 게 실제 검색 습관이라서요.
- 시술 상세는 `{시술명} - {병원명} | 서비스명`으로 바꿨어요. 시술명만으로는 "○○의원 스마일라식" 같은 조합 검색어에 걸리지 않아요. description에는 응답에 이미 있는데 화면에서만 쓰던 시술 구성 문구를 넣었어요.
- 검색 결과는 탭마다 제목을 다르게 했어요. 제목이 같으면 구글이 거의 같은 문서로 보고 한쪽을 접는데, 그때 어느 쪽이 남을지 우리가 고를 수 없거든요.

역 이름 뽑기가 의외로 까다로웠어요. 병원 정보에는 "명동역 6번 출구" 같은 문구가 와서 역 이름만 잘라 써야 했는데, 코드 리뷰에서 "강남역에서 도보 5분", "선릉역(2호선)", "강남역1번출구" 같은 표기를 놓친다는 지적이 나왔어요. 거꾸로 "지역"이나 "역" 한 글자는 통과시키고 있었고요. 제외어 목록으로 막아 보려 했는데, 접미사 검사로 바꿔 보니 "서울대입구역"이 '구역'에 걸려 버렸어요. 문자열 규칙만으로 가를 수 없는 문제라고 보고, 제외어 목록은 걷어내고 그 판단을 주석으로 남겼어요.

## 구조화 데이터는 붙이는 것보다 맞게 붙이는 게 어려웠어요

그때까지 나가던 JSON-LD는 루트 layout의 광고 배너 목록 하나뿐이었어요. 병원 상세가 병원에 관한 문서라는 걸 기계가 알 방법이 없었죠.

병원 상세에는 `MedicalClinic`(주소, 좌표, 전화, 진료과, 별점)과 `BreadcrumbList`를, 검색 결과에는 `CollectionPage`를 붙였어요. 값은 전부 서버가 이미 받아 둔 응답에서 꺼내요. `generateMetadata`와 같은 요청 범위 캐시를 읽으니 조회가 더 늘지 않아요.

시술 상세는 타입을 고르는 데서 고민했어요.

<div class="note note-decision">
  <strong>시술 상세는 Product로 내기로 했어요</strong>
  <p>의미만 보면 MedicalProcedure가 더 가까워요. 그런데 그 타입에는 offers가 없어서 가격을 담을 자리가 없어요. 사용자가 시술을 고를 때 가장 먼저 보는 게 가격이라, 가격이 있으면 Product와 Offer로 내고 시술이라는 성격은 additionalType으로 밝혔어요. 별점은 병원의 것이라 시술에는 붙이지 않았어요.</p>
</div>

붙이고 나서 구조화 데이터만 따로 검토해 봤더니, 겉보기에는 멀쩡한데 무효인 마크업이 있었어요.

하나는 별점 척도였어요. 별점은 10점 만점이라 화면에 `9.3 / 10`으로 그리는데, 마크업에는 `bestRating`을 5로 적어 두었어요. 평점이 선언한 범위를 벗어나니 후기가 있는 병원 전부가 무효 마크업이었던 거예요.

```ts
// 별점은 10점 만점이에요. 척도를 안 적으면 기본값 5가 쓰여 평점이 범위를 벗어나요
const RATING_SCALE = { best: 10, worst: 0 } as const;

// 후기가 없는 병원에 평점을 붙이면 화면과 어긋나서, 1건 이상일 때만 내요
const toAggregateRating = (starRating?: number | null, reviewCnt?: number | null) =>
  reviewCnt && reviewCnt > 0 && starRating
    ? {
        '@type': 'AggregateRating',
        ratingValue: starRating,
        reviewCount: reviewCnt,
        bestRating: RATING_SCALE.best,
        worstRating: RATING_SCALE.worst,
      }
    : undefined;
```

다른 하나는 가격이었어요. 운영 API를 보니 로그인하지 않은 요청에는 우대가가 0으로 내려와요. 크롤러는 로그인하지 않으니, 시술 상세는 가격 칸만 있고 값은 없는 Product로 나가고 있었어요. 가격이 있을 때만 Product와 Offer를 내고, 없으면 MedicalProcedure로 내게 바꿨어요.

검색 결과의 breadcrumb 마지막 항목이 noindex로 나가는 빈 검색 화면을 가리키던 것도 이때 고쳤어요. 구조화 데이터는 화면에 드러나지 않아서 틀려도 아무도 모르니, 척도와 타입 분기는 테스트로 고정했어요.

## 막는 방법도 다시 골랐어요

색인에서 빼야 할 페이지를 어떻게 빼느냐도 다시 봤어요.

캠페인 랜딩은 robots.txt로 막혀 있었어요. 그런데 robots로 막으면 크롤러가 문서를 아예 읽지 못해서, 카카오톡이나 페이스북 공유 카드의 OG 태그까지 같이 사라져요. 캠페인은 공유하라고 만든 주소인데 말이에요. robots 차단을 풀고 랜딩 전용 layout 하나에서 noindex를 내보내게 했어요. 라우트마다 손으로 붙이면 새 랜딩이 생길 때 조용히 색인될 테니까요.

robots.txt는 허용 목록 방식이었어요. 이름을 적지 않은 봇은 막히는데, 그 안에 Search Console의 URL 검사 봇과 카카오톡 미리보기 봇이 들어 있었어요. 허용 목록을 넓히고, 크롤러 정책을 바꿔 배포해도 앞단 캐시가 옛 파일을 붙들지 않게 robots.txt에 `Cache-Control`도 명시했어요.

사이트맵도 손봤어요. 검색어 없는 검색 화면은 noindex인데 사이트맵에 올라가 있어서, Search Console에 "제출된 URL이 noindex로 표시됨"이 쌓이는 상태였어요. 그 주소를 사이트맵에서 뺐어요. 반대로 검색창에 아무렇게나 친 검색어는 색인이 열려 있어서, 사용자가 넣은 임의의 말이 제목과 구조화 데이터에 실려 검색 결과에 남을 수 있었어요. 사이트맵이 제출하는 시술 검색만 색인하도록 판정 함수를 하나 두고, robots 메타와 JSON-LD가 같은 함수를 보게 했어요. 따로 판정하면 noindex를 내보내면서 구조화 데이터로는 같은 검색어를 계속 선언하는 상태가 조용히 생기거든요.

지워진 공지도 같은 맥락이었어요. 공지 API가 404로 답하면 메타데이터는 noindex로 물러서고, 본문은 데이터 없이 로딩 스피너만 끝없이 돌았어요. 지운 공지 주소가 빈 화면으로 살아남아 방문할 때마다 경고가 쌓였죠. 병원 상세처럼 404일 때는 `notFound()`로 끝내게 바꿨어요.

## "안산 치과"가 들어올 주소를 만들었어요

"안산 치과"처럼 지역과 진료과를 함께 검색하는 사람이 도착할 페이지가 없었어요. 새 경로를 만들지는 않았어요. 검색 화면의 병원 필터 주소(`?tab=hospital&mode=filter&subRegion=…`)가 이미 노출되고 있었는데, noindex에 canonical도, 사이트맵도, 지역 이름이 들어간 제목도 없었을 뿐이에요. 리다이렉트로 넘기면 도착한 쪽이 색인되니 그 주소 자체를 열기로 했어요.

- 필터를 지역 하나와 진료과 하나로만 좁힌 주소만 열고, 검색어나 혜택 같은 다른 조건이 붙으면 지금처럼 noindex로 둬요.
- 제목은 `{지역} {진료과} 추천 병원 (연도)`예요. 중구처럼 같은 이름의 구가 시도마다 있어서 지역 이름 앞에 시도를 붙였어요.
- canonical과 사이트맵 주소는 같은 함수로 만들어요. 따로 만들면 언젠가 어긋나요.
- 사이트맵에는 제휴 병원이 3곳 이상인 조합만 올렸어요. 병원 수는 화면이 부르는 병원 필터 API로 세요. 지역에 병원을 묶는 규칙은 서버에 있어서 흉내 내지 않았어요.

dev 데이터 기준으로 114개 주소가 올라갔고, 첫 생성에 15초쯤 걸렸어요. 지역 값이 바뀌면 옛 주소는 noindex로 물러서고 사이트맵이 새 값으로 다시 만들어져요. 그래서 리다이렉트는 두지 않았어요.

## 봇이 받는 HTML에는 목록이 없었어요

여기까지 고치고 나서, JS를 실행하지 않는 봇이 받는 HTML을 다시 열어 봤어요. 사이트맵에 올린 검색 주소의 서버 HTML에 목록이 없었어요. 로딩 상태 그대로였어요. 브라우저에서는 스피너 뒤에 목록이 금방 떠서 눈으로는 못 잡는 회귀였어요.

키워드 검색은 서버가 목록을 미리 받아 두고 있었어요. 그런데 라우트와 화면 훅이 서로 다른 스키마로 URL을 읽고 있었어요. 라우트 쪽 스키마는 주소에 없는 혜택 키를 `false`로 채우고, 화면 쪽은 비워 둬요. 그 값이 queryKey에 그대로 들어가 키가 갈리니, 서버가 받아 둔 목록을 화면이 찾지 못하고 처음부터 다시 받았어요. 사이트맵의 검색 주소 678개가 전부 그 상태였어요. 목록 조회 조건은 화면 쪽 스키마로 읽게 맞추고, 서버 컴포넌트는 단위 테스트로 볼 수 없어서 prefetch 분기를 테스트할 수 있는 곳으로 옮겼어요.

진료과 검색은 더 단순했어요. 라우트가 진료과 목록만 미리 받고 병원 목록은 클라이언트에서만 받고 있었어요. 화면 훅이 쓰는 조회 조건을 함수로 떼어 서버 prefetch와 같이 쓰게 했어요. 훅은 위치 스토어의 좌표를 queryKey에 싣는데 서버는 그 스토어를 모르니, 스토어의 초기 좌표를 상수로 빼서 양쪽이 같이 써요. 봇처럼 페이지를 새로 여는 요청은 스토어도 그 초기값이라 키가 맞아요. prefetch가 왜 끝날 때까지 기다려야 하는지는 [14번 글](https://jingeon27.tistory.com/14)에 따로 정리했어요.

이 회귀는 화면으로는 다시 못 잡으니 E2E로 고정했어요. dev 서버 사이트맵에서 시술, 병원, 진료과 검색 주소를 골라 `OAI-SearchBot` UA로 요청하고, `<script>`를 걷어낸 HTML에 카드 링크와 canonical이 있는지 봐요.

## AI 검색 봇에게는 메타데이터를 head로 보냈어요

마지막으로 걸린 건 메타데이터가 실리는 자리였어요. Next.js는 `generateMetadata`가 있는 페이지에서 제목, canonical, robots를 본문 뒤로 스트리밍해 `<body>`에 실어요. `<head>`에 넣어 보내는 건 `htmlLimitedBots`에 걸린 UA뿐이에요. 그런데 기본 목록에 OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot 같은 AI 검색 봇과 Daum, kakaotalk-scrap이 없었어요. 이 봇들은 canonical을 `<body>`에서 받고 있었는데, `link rel=canonical`은 `<head>`에 있어야 유효해요.

```ts
import { HTML_LIMITED_BOT_UA_RE } from 'next/dist/shared/lib/router/utils/html-bots';

// robots.txt가 사이트 전체를 여는 봇 중 Next 기본 목록에 없는 이름 (일부만 옮겼어요)
const ADDITIONAL_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'PerplexityBot', 'Daum', 'kakaotalk-scrap'];

// 이 설정은 기본 목록을 덮어써서, Next의 기본 정규식에 이어 붙여요
export const HTML_LIMITED_BOTS = new RegExp(`${HTML_LIMITED_BOT_UA_RE.source}|${ADDITIONAL_BOTS.join('|')}`, 'i');
```

<div class="note note-decision">
  <strong>Googlebot은 목록에 넣지 않았어요</strong>
  <p>Googlebot은 렌더링한 DOM에서 메타데이터를 읽어서 Next가 일부러 기본 목록에서 뺐어요. 넣으면 그 요청의 첫 바이트가 generateMetadata가 끝날 때까지 늦어져요. 모든 UA에 스트리밍을 끄는 방법도 같은 이유로 쓰지 않았어요.</p>
</div>

봇을 robots.txt에 더하고 이 목록에 더하는 걸 잊을 수 있어서, robots.txt가 사이트 전체를 여는 봇이 Googlebot 계열 말고는 전부 이 정규식에 걸리는지 테스트가 대조해요.

## 바꾼 뒤에는 이렇게 확인했어요

- 구조화 데이터는 별점 척도와 Product, MedicalProcedure 분기를 테스트로 고정했어요.
- 검색 화면은 "화면 훅이 첫 렌더부터 서버가 받아 둔 목록을 읽는다"를 테스트로 봐요. 옛 스키마로 되돌리거나 prefetch 좌표를 바꾸면 테스트가 실패하는 것까지 확인했어요.
- 봇이 받는 HTML은 위의 E2E가 봐요.
- 검진 항목 화면은 dev 서버에서 HTML과 JSON-LD, sitemap.xml을 직접 열어 확인했어요.

검색 노출이나 유입이 얼마나 바뀌었는지는 아직 따로 확인하지 않았어요. 이번에 고친 건 검색엔진이 받는 문서가 화면과 같은 말을 하게 만든 데까지예요.

## 다음 작업에는 이 기준을 남겼어요

크롤러가 받는 문서는 브라우저로 화면을 볼 때 드러나지 않아요. 그래서 사람의 주의보다 구조에 기대기로 했어요. canonical과 사이트맵 주소는 같은 함수로 만들고, 색인 여부는 robots 메타와 구조화 데이터가 같은 판정 함수를 봐요. 이동은 `router.push` 대신 링크로 만들고, 봇이 받는 HTML은 봇 UA로 요청하는 E2E가 지켜요.

## 참고

- [Next.js: generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js: htmlLimitedBots](https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots)
- [Google Search Central: 중복 URL 통합과 canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google Search Central: noindex로 색인 차단하기](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Google Search Central: 크롤링 가능한 링크](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Google Search Central: 리뷰 스니펫과 AggregateRating](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- [Next.js App Router에서 prefetch를 기다려야 하는 경우](https://jingeon27.tistory.com/14)
- [동적 사이트맵에서 공개 API와 인증 API의 경계를 나눈 과정](https://jingeon27.tistory.com/21)
