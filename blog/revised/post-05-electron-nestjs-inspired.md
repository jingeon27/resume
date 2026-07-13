# Electron 크롤링 앱에 NestJS의 책임 분리를 참고한 과정

입사 당시 Electron 앱은 여러 채용 플랫폼에서 지원자를 수집하고 있었다. 플랫폼마다 로그인 방식과 DOM 구조는 달랐지만, 로그인, 중복 확인, 지원자 저장, 이력서 업로드라는 큰 흐름은 같았다. 그런데 각 플랫폼 파일이 이 흐름을 모두 들고 있어 공통 동작을 바꾸려면 여러 파일을 함께 수정해야 했다.

백엔드 팀의 NestJS 코드를 보면서 Controller와 Service의 책임 분리, 생성자 주입, Module의 의존성 매핑 방식을 참고했다. 다만 Electron 앱에 NestJS나 DI 컨테이너를 넣은 것은 아니다. 필요한 개념만 TypeScript 클래스와 Factory로 옮겼다.

## 먼저 바꾸고 싶었던 것

기존 구조에서는 플랫폼별 함수 하나가 다음 작업을 모두 수행했다.

```text
로그인
  -> 목록 수집
  -> 중복 확인
  -> 지원자 등록
  -> 파일 다운로드 및 업로드
```

플랫폼이 추가될 때 기존 파일을 복사한 뒤 selector와 예외 처리를 바꾸는 방식이어서, 공통 로직과 플랫폼별 로직의 경계가 계속 흐려졌다.

목표는 계층을 많이 만드는 것이 아니라 변경 이유를 세 가지로 나누는 것이었다.

- IPC 요청이 바뀌면 Controller만 수정한다.
- 전체 처리 순서가 바뀌면 CrawlingService만 수정한다.
- 특정 사이트의 DOM이나 로그인 방식이 바뀌면 해당 플랫폼 구현만 수정한다.

## 1. IPC는 Controller에서 받는다

Electron의 `ipcMain` handler를 HTTP Controller와 비슷한 진입점으로 봤다.

```ts
const createCrawlingService =
  (puppeteer: PuppeteerService) =>
  (platform: Platform) =>
    new CrawlingService(puppeteer, platform);

export function createCrawlingController(puppeteer: PuppeteerService) {
  const createService = createCrawlingService(puppeteer);

  const services = {
    saramin: createService('saramin'),
    wanted: createService('wanted'),
    jobkorea: createService('jobkorea'),
  } satisfies Record<Platform, CrawlingService>;

  return {
    async collect({ platform }: { platform: Platform }) {
      return services[platform].collect();
    },
  };
}
```

Controller는 플랫폼에 맞는 Service를 고르고 결과를 반환한다. 로그인이나 DOM 파싱 규칙은 알지 않는다.

## 2. Service는 처리 순서만 가진다

```ts
export class CrawlingService {
  constructor(
    private readonly puppeteer: PuppeteerService,
    private readonly platform: Platform,
  ) {}

  async collect() {
    const config = CRAWLING_HANDLERS[this.platform];
    const page = await this.puppeteer.open(config.pages.recruit);

    await config.login(page);

    const processor = new config.Processor({ page });
    await processor.collectCandidates();
    await processor.removeDuplicates();
    await processor.saveCandidates();
    await processor.uploadResumes();
  }
}
```

`PuppeteerService`를 생성자에서 받도록 한 부분은 NestJS의 constructor injection에서 참고했다. 여기서는 컨테이너가 자동으로 주입하지 않고 Factory가 직접 인스턴스를 만든다.

## 3. 플랫폼 차이는 Abstract Class와 설정 객체로 묶는다

```ts
abstract class CandidateProcessor {
  abstract collectCandidates(): Promise<void>;
  abstract removeDuplicates(): Promise<void>;
  abstract saveCandidates(): Promise<void>;
  abstract uploadResumes(): Promise<void>;
}

const CRAWLING_HANDLERS = {
  saramin: {
    pages: SARAMIN_PAGES,
    login: loginSaramin,
    Processor: SaraminProcessor,
  },
  wanted: {
    pages: WANTED_PAGES,
    login: loginWanted,
    Processor: WantedProcessor,
  },
  jobkorea: {
    pages: JOBKOREA_PAGES,
    login: loginJobkorea,
    Processor: JobkoreaProcessor,
  },
} as const satisfies Record<Platform, CrawlingHandler>;
```

Abstract Class는 플랫폼 구현이 지켜야 할 처리 단계를 컴파일 단계에서 확인한다. 설정 객체는 NestJS Module처럼 구현 클래스와 보조 함수를 한곳에서 연결하지만, 런타임 DI나 decorator를 사용하지 않는다.

## 실제로 얻은 것

- 공통 처리 순서가 `CrawlingService` 한곳에 모였다.
- 플랫폼별 selector와 예외 처리는 각 구현 안으로 좁혀졌다.
- 새 플랫폼은 Processor와 로그인 함수를 구현하고 설정 객체에 등록하는 흐름으로 추가할 수 있게 됐다.
- Puppeteer 의존성을 생성자 경계로 옮겨 대체 객체를 주입할 수 있는 구조가 됐다.

여기서 구분할 점도 있다. **테스트 가능한 구조와 테스트가 있는 구조는 다르다.** 당시에는 의존성을 교체할 수 있는 경계까지 만들었지만 자동화 테스트를 충분히 붙이지 못했다. 따라서 회귀 방지율이나 버그 감소율을 수치로 말하기보다, 변경 범위가 플랫폼 구현 또는 공통 Service 중 한쪽으로 좁아졌다는 사실을 성과로 보는 편이 정확하다.

## 마치며

이 작업은 NestJS를 Electron에 이식한 것이 아니다. NestJS에서 배운 책임 분리와 의존성 주입의 방향을, 별도 프레임워크 없이 Electron main process에 맞게 적용한 경험이다. 패턴의 이름보다 중요했던 것은 어떤 변경이 어느 파일에서 끝나야 하는지를 먼저 정한 일이었다.
