# 포트폴리오용 화면 캡처

2026-09-28에 stage 테스트 데이터로 찍었어요. 로컬 dev 서버를 stage API에 붙여 흐름을 실제로 진행했고, 새로 만든 데이터에는 `[포트폴리오]`를 붙였어요. 운영 도구는 1440×900, 복지몰은 390×844(모바일)이고 모두 2배율이에요. `-full` 은 드로어·페이지 전체를 한 장에 담은 컷이에요.

## 쓰기 전에 알아둘 것

- **가린 곳:** `ops-nonpay/08` 의 검수자 실명은 '관리자'로, `mall-healthcheck/04`·`05-full` 의 진료 대상 연락처·생년월일은 가짜 값(010-0000-0000, 1990.01.01)으로 캡처 브라우저 화면에서만 바꿨어요. 서버 데이터는 그대로예요. 복지몰 비급여 화면의 연락처·생년월일 마스킹(`010-****-****`)은 앱이 원래 하는 표시예요.
- **검진 프로그램 상세(`mall-healthcheck/01`·`02`):** 지금 코드는 검진 상세에 들어오면 외부 아웃링크로 이동해서 실제 사용자는 이 화면을 보지 못해요. 캡처 브라우저에서만 이동을 막고 찍었으니 "운영 중인 화면"으로 쓰지 마세요.
- **결제:** stage checkout 이 토스 **live** 키를 내려줘서 결제창(`mall-healthcheck/09`)까지만 찍었어요. 결제 후 검진 예약 상세는 없어요.
- **쿠폰:** 테스트 계정에 쿠폰이 없어 쿠폰 적용가·자동 적용 상태는 찍지 못했어요.
- **이미지:** 프로그램 썸네일·상세 이미지는 캡처용 단색 PNG예요. `mall-healthcheck` 의 검진 썸네일은 stage 테스트 병원에 원래 있던 이미지라, 공개용으로 쓸 때는 가리는 편이 안전해요.

## 역할 구분 (AGENTS.md 기준)

- 병원 관리자의 프로그램 등록·검수 요청, Back-Office의 검수·반려·승인 화면은 본인이 처음 만들었어요.
- 건강검진의 Back-Office·병원 관리자 검진 구성 화면, 복지몰 검진 상세의 내부 구성·선택 검사 Bottom Sheet·예약 신청 흐름은 본인 작업이에요. 선택 수를 채우면 미선택 chip 을 비활성화하는 동작은 담당자와 논의해 정했어요.
- 복지몰 **비급여 프로그램 상세**는 동료가 주로 만든 화면이에요(본인은 스타일·OG 메타·이벤트). 캡션에서 본인 화면처럼 쓰지 마세요.
- 복지몰 시각 디자인은 브랜드 디자이너 시안이에요. 캡션에는 본인이 정하거나 구현한 동작만 적어요.

## 비급여 프로그램 등록·검수 (병원 관리자 → Back-Office → 병원 관리자)

| 파일 | 화면 |
| --- | --- |
| [`01-pa-program-form-full.png`](ops-nonpay/01-pa-program-form-full.png) | 같은 드로어를 위에서 아래까지 한 장에 담았다. 우대가 정책 안내 콜아웃, 기본 정보, 상세 이미지, 임시저장·검수요청 버튼까지 보인다 |
| [`01-pa-program-form.png`](ops-nonpay/01-pa-program-form.png) | PA(pa_nonpay) 프로그램 등록 드로어. 기본 정보 섹션을 채운 상태이고, 왼쪽 미리보기에 이름·정가 300,000·우대가 240,000(20%)·VAT포함·설명이 그대로 반영된다 |
| [`02-pa-inspection-confirm-modal.png`](ops-nonpay/02-pa-inspection-confirm-modal.png) | '검수 요청하시겠습니까?' 모달. 신규등록 태그, 프로그램명, 검수 요청사항 메모가 들어 있고 '검수 요청하기' 버튼이 보인다 |
| [`03-pa-inspection-detail-reviewing.png`](ops-nonpay/03-pa-inspection-detail-reviewing.png) | 요청을 보내면 자동으로 이동하는 PA 검수요청 상세. 상단 배너가 '검수중 · 신규등록'이고 요청 일시와 요청사항이 보인다 |
| [`04-pa-inspection-list-reviewing.png`](ops-nonpay/04-pa-inspection-list-reviewing.png) | PA 검수요청 내역 목록 맨 위 행이 [포트폴리오] 레진 충치치료 1치아이고 상태 태그는 '검수중'이다 |
| [`05-bo-inspection-list.png`](ops-nonpay/05-bo-inspection-list.png) | BO 검수요청 목록 맨 위 행이 방금 보낸 요청 553973311987750이다(상태 '검수요청', 치과/충치치료/레진) |
| [`06-bo-inspection-detail-actions.png`](ops-nonpay/06-bo-inspection-detail-actions.png) | 같은 드로어 아래쪽. 가격·VAT·설명·상세 이미지 아래에 검수중 스위치와 반려·승인 버튼, 이전·다음 버튼이 보인다 |
| [`06-bo-inspection-detail-full.png`](ops-nonpay/06-bo-inspection-detail-full.png) | 배너부터 반려·승인 버튼까지 BO 검수요청 상세 전체를 한 장에 담았다 |
| [`06-bo-inspection-detail.png`](ops-nonpay/06-bo-inspection-detail.png) | BO 검수요청 상세 드로어 위쪽. '검수중 · 신규등록' 배너, 요청 일시·요청사항 표, 미리보기, CMS 설정(라벨·가격 미노출·숨김·특가전·쿠폰 등)이 보인다 |
| [`07-bo-inspection-switch-reviewing.png`](ops-nonpay/07-bo-inspection-switch-reviewing.png) | 검수중 스위치를 켠 뒤의 처리 영역. 스위치가 켜져 있고 반려·승인 버튼이 보인다 |
| [`08-bo-inspection-approved.png`](ops-nonpay/08-bo-inspection-approved.png) | 승인 뒤 검수요청 상세. 배너는 '승인 · 신규등록'이다. 노출 일시 2026-09-28 16:51, 검수 처리 일시·등록 일시 16:51:50, 반려사유 '-', 요청사항, 처리내역 '상세보기'가 보이고 폼은 읽기 전용이다. 검수자 칸에는 '관리자'로 나온다 |
| [`09-bo-program-detail-full.png`](ops-nonpay/09-bo-program-detail-full.png) | BO 프로그램 상세 드로어 전체. CMS 설정, 기본 정보, 상세 이미지, 하단 버튼까지 담았다 |
| [`09-bo-program-detail.png`](ops-nonpay/09-bo-program-detail.png) | 승인으로 생긴 프로그램(553973511970444)의 BO 상세 드로어. 노출 예정일 2026-09-28, 등록일시, 미리보기, CMS 설정, 하단 초기화·삭제·수정 버튼이 보인다 |
| [`10-pa-program-list-approved.png`](ops-nonpay/10-pa-program-list-approved.png) | 승인 뒤 PA 프로그램 목록 맨 위에 [포트폴리오] 레진 충치치료 1치아가 올라왔다(충치치료/레진, 썸네일 표시) |
| [`11-pa-program-detail-full.png`](ops-nonpay/11-pa-program-detail-full.png) | PA 프로그램 상세 드로어 전체. 하단 삭제요청·검수요청 버튼까지 담았다 |
| [`11-pa-program-detail.png`](ops-nonpay/11-pa-program-detail.png) | PA 프로그램 상세 드로어. 노출(예정)일시 2026-09-28 16:51, 등록 일시, 등록자, 우대가 정책 안내, 미리보기, 기본 정보가 보인다 |
| [`12-pa-inspection-list-approved.png`](ops-nonpay/12-pa-inspection-list-approved.png) | PA 검수요청 내역에서 같은 요청이 '승인'으로 바뀌었고 처리일시 2026-09-28 16:51이 채워졌다 |

## 건강검진 프로그램 등록 (Back-Office → 병원 관리자 읽기 전용)

| 파일 | 화면 |
| --- | --- |
| [`02-bo-program-register-form-full.png`](ops-healthcheck/02-bo-program-register-form-full.png) | 등록 드로어 전체. CMS 설정(프로그램 숨김 체크, [포트폴리오] 메모), 기본 정보(병원 건강검진테스트, 썸네일, 프로그램명, 카테고리 건강검진>종합건강검진>종합검진, 정가 300,000/우대가 250,000/할인율 16%, 예약금 30,000, VAT), 검진 구성, 상세 이미지(검진 템플릿). 왼쪽은 검사 구성까지 그려진 미리보기. |
| [`02-bo-program-register-form.png`](ops-healthcheck/02-bo-program-register-form.png) | BO /hospital/program 의 '프로그램 등록' 드로어. 뷰포트를 검진 구성 구획에 맞췄다. 필수 항목 7개(신체계측·시력·체성분·심전도·혈당·기본문진·흉부X-선), 선택 그룹 '위내시경'(택1, 비수면/수면), 선택 그룹 '정밀 영상검사'(택2, 초음파 3종·뇌CT·폐CT)가 채워져 있고, 왼쪽 미리보기에 선택 그룹 칩이 보인다. 아래쪽 고정 푸터에 '등록' 버튼이 있다. |
| [`03-bo-program-detail-composition.png`](ops-healthcheck/03-bo-program-detail-composition.png) | BO 상세의 검진 구성 구획. 서버에 저장된 필수 7항목과 선택 그룹 2개(위내시경 택1, 정밀 영상검사 택2)가 그대로 다시 불러와졌고, 편집할 수 있는 상태(태그 X·삭제·선택 그룹 추가 활성)다. |
| [`03-bo-program-detail-full.png`](ops-healthcheck/03-bo-program-detail-full.png) | BO 프로그램 상세 드로어 전체(요약 표 → 미리보기/CMS 설정/기본 정보/검진 구성/상세 이미지 → 삭제·수정 푸터). |
| [`03-bo-program-detail.png`](ops-healthcheck/03-bo-program-detail.png) | 새로 불러온 BO /hospital/program?hospitalId=522900257658112&programId=553973494619887 의 '프로그램 상세' 드로어 상단. 노출 예정일 '검수 승인 시점', 등록일시 2026-09-28 16:51, 미리보기, CMS 설정(숨김·메모), 병원명이 보이고 푸터에 삭제/수정 버튼이 있다. |
| [`04-pa-program-detail-readonly-composition.png`](ops-healthcheck/04-pa-program-detail-readonly-composition.png) | PA 상세의 검진 구성 구획. 왼쪽 미리보기의 검사 구성(기본 항목 7개, 위내시경 택1, 정밀 영상검사 택2)과 오른쪽 폼이 나란히 보인다. 폼은 모두 비활성이라 필수/선택 태그에 X가 없고, 그룹명·선택 개수·삭제·'+ 선택 그룹 추가'가 회색으로 잠겨 있다. BO 화면(03)과 대비해 읽기 전용임이 드러난다. |
| [`04-pa-program-detail-readonly-full.png`](ops-healthcheck/04-pa-program-detail-readonly-full.png) | PA 상세 드로어 전체. 가격·예약금·VAT·설명·검진 구성·상세 이미지 라디오까지 모두 잠겨 있고, 맨 아래에 검수요청/삭제요청 버튼이 없다. |
| [`04-pa-program-detail-readonly.png`](ops-healthcheck/04-pa-program-detail-readonly.png) | PA(pa_healthcheck)에서 연 같은 프로그램의 '프로그램 상세' 드로어(전체 폭) 상단. 노출(예정)일시, 검수 가이드 안내, 미리보기, 그리고 회색으로 잠긴 프로그램명·카테고리 입력칸이 보인다. |

## 복지몰 건강검진 예약 (모바일)

| 파일 | 화면 |
| --- | --- |
| [`01-program-detail-full.png`](mall-healthcheck/01-program-detail-full.png) | 상세 전체 한 장입니다. 검사 구성(기본 8개, 선택 A 택1·B 택3·C 택1), 병원 위치·진료시간, 안심 혜택이 들어 있습니다. |
| [`01-program-detail.png`](mall-healthcheck/01-program-detail.png) | 건강검진테스트 병원의 'A 종합건강검진' 상세 상단입니다. 썸네일, 탭, 가격(25%, 300,000원), 설명, 방문예약 버튼이 보입니다. 390x844 뷰포트입니다. |
| [`02-program-composition.png`](mall-healthcheck/02-program-composition.png) | '검사 구성' 구획을 화면 위쪽에 맞춘 컷입니다. 기본 검사 요약과 선택 검사 A·B·C 아코디언이 보입니다. |
| [`03-select-items-sheet.png`](mall-healthcheck/03-select-items-sheet.png) | 선택 검사 Bottom Sheet를 연 상태입니다. B 택3을 다 채워 고르지 않은 칩(HPV, 유방초음파)이 비활성화돼 있고, C가 남아 있어 '선택 완료'는 잠겨 있습니다. |
| [`04-reservation-form-items.png`](mall-healthcheck/04-reservation-form-items.png) | '선택 검사' 구획이 sticky 헤더(60px) 바로 아래에서 시작합니다. A 위내시경(수면), B 상복부·갑상선·경동맥초음파, C 뇌(머리)CT 칩이 채워져 있습니다. 그 아래에 진료 대상 카드(김진건 본인, 연락처 010-0000-0000, 생년월일 1990.01.01)와 가족·지인 추가 버튼, 안내 문구가 이어집니다. |
| [`05-reservation-form-full.png`](mall-healthcheck/05-reservation-form-full.png) | 필수 항목을 모두 채운 신청 폼 전체입니다(390x3810). 순서대로 선택 검사, 진료 대상(연락처 010-0000-0000, 생년월일 1990.01.01), 9/30(수) 오전 9:00, 공단 '예', 주소, 빈 기업 검진 코드, 전달사항, 결제 금액(예약금 20,000원), 약관 전체 동의, 청약철회 안내, 활성화된 '예약 신청하기'가 이어집니다. |
| [`05-reservation-form-inputs.png`](mall-healthcheck/05-reservation-form-inputs.png) | 공단 검진 대상자 '예', 주소(판교역로 166, 101호), 빈 기업 검진 코드 칸, 병원 전달사항 '[포트폴리오] 캡처용 테스트 예약'이 보입니다. |
| [`06-reservation-payment-summary.png`](mall-healthcheck/06-reservation-payment-summary.png) | 총 검진 예상 비용 300,000원(25%), 예약금 -20,000원, 현장 결제 예상 280,000원, 지금 결제할 금액(예약금) 20,000원과 약관 동의가 보입니다. |
| [`07-support-code-unverified.png`](mall-healthcheck/07-support-code-unverified.png) | 코드를 적고 '코드 확인'은 누르지 않은 상태입니다. '코드 확인을 눌러야 적용돼요.' 안내가 보이고 신청 버튼이 잠깁니다. |
| [`08-confirm-sheet-notice.png`](mall-healthcheck/08-confirm-sheet-notice.png) | 확인 시트 안에서 '예약금 20,000원을 결제할게요 / 차액은 병원 내원 후 결제 예정이에요' 안내와 취소·확인 버튼이 함께 보이는 컷입니다. |
| [`08-confirm-sheet.png`](mall-healthcheck/08-confirm-sheet.png) | '예약 전 신청 정보 확인' Bottom Sheet입니다. 예약 정보(병원, 프로그램, 선택 검사 5개, 진료 대상 김진건 본인, 9월 30일(수) 오전 9:00)와 결제 정보 표가 보입니다. |
| [`09-toss-payment-window.png`](mall-healthcheck/09-toss-payment-window.png) | 확인 시트에서 '확인'을 누른 뒤 뜬 토스 결제위젯 결제창(모바일 레이아웃)입니다. 결제 방법, 무이자 할부 안내, 필수 약관, '결제하기' 버튼이 보입니다. |

## 복지몰 비급여 예약 (모바일)

| 파일 | 화면 |
| --- | --- |
| [`01-program-detail-full.png`](mall-nonpay/01-program-detail-full.png) | 프로그램 상세 전체(fullPage, 780x6564). '시술정보' 탭 선택, 가격 블록 바로 아래 '프로그램 설명' 헤더, 리뷰 요약, 병원 위치·진료시간, 안심 혜택, 추천 대상, 추가 혜택, 시술 특장점, 다른 시술, 연관 시술, 함께 본 병원이 이어지고, 페이지 맨 끝에 '전화상담'·'방문예약' CTA 바가 한 번만 나온다 |
| [`01-program-detail.png`](mall-nonpay/01-program-detail.png) | (T) 세이프닥치과 동대문점 '동대문 레이저' 상세 첫 화면. 히어로 이미지, 탭, 포인트 적립 배너, 시술명, 평점, 정가 400,000원에서 5% 할인된 380,000원, 하단 고정 '전화상담'·'방문예약' 버튼이 보인다 |
| [`02-program-price-cta.png`](mall-nonpay/02-program-price-cta.png) | 이미지 아래로 내려서 가격 블록(할인율·우대가), 프로그램 설명, 리뷰 요약과 하단 '전화상담'·'방문예약' CTA를 한 화면에 모은 컷 |
| [`03-reservation-form.png`](mall-nonpay/03-reservation-form.png) | '방문예약'을 눌러 들어간 예약신청 첫 화면. 시술 카드, 프로그램 설명 아코디언, 세이프닥 예약 혜택 안내, 포인트 배너와 진료 대상(본인 선택)이 보인다 |
| [`04-reservation-target.png`](mall-nonpay/04-reservation-target.png) | 진료 대상 섹션. '본인' 카드가 선택되어 있고, 가족·지인 추가 버튼과 안내 문구, 내원 희망 일시 섹션 시작부가 보인다 |
| [`05-reservation-datetime.png`](mall-nonpay/05-reservation-datetime.png) | 내원 희망 일시. '예약 확정이 아니에요' 안내, 달력에서 9월 30일(수), 오전 10:30이 선택된 상태 |
| [`06-reservation-message-submit-full.png`](mall-nonpay/06-reservation-message-submit-full.png) | 입력을 모두 채운 예약신청 폼 전체(fullPage) |
| [`06-reservation-message-submit.png`](mall-nonpay/06-reservation-message-submit.png) | 병원 전달사항에 '[포트폴리오] 캡처용 테스트 예약'을 입력한 상태. 추가 상담 희망 시술, 약관 동의, 활성화된 '예약 신청하기' 버튼이 보인다 |
| [`07-reservation-confirm-sheet.png`](mall-nonpay/07-reservation-confirm-sheet.png) | '예약 전 신청 정보 확인' Bottom Sheet. 병원, 신청 시술, 진료 대상(본인), 희망 내원 시간 9월 30일(수) 오전 10:30, 요청 사항, 취소·확인 버튼 |
| [`08-reservation-submitted.png`](mall-nonpay/08-reservation-submitted.png) | 확인을 누른 뒤 뜨는 성공 다이얼로그 '예약 신청이 접수되었어요.' |
| [`09-reservation-detail-full.png`](mall-nonpay/09-reservation-detail-full.png) | 예약 상세 전체(fullPage) |
| [`09-reservation-detail.png`](mall-nonpay/09-reservation-detail.png) | 신청 뒤 이동한 예약 상세(/profile/reservation/553973466184253). 예약대기 배지, 진행 단계, 예약 정보, 병원 전달 사항, 예약 취소하기 버튼 |
