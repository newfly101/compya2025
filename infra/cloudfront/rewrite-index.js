// CloudFront Function (viewer request) — 디렉터리 경로를 index.html 로 리라이트한다.
//
// 왜 필요한가
//   S3 를 REST origin 으로 쓰면 디렉터리 인덱스 개념이 없다. Default Root Object 는
//   루트("/") 에만 적용되므로 "/legend-stats" 는 S3 에서 404 가 나고, SPA fallback
//   (404 → /index.html) 이 홈 스냅샷을 대신 내준다. 그래서 prerender 로 만든
//   라우트별 스냅샷이 전부 무시됐다.
//
// 무엇을 하는가
//   "/legend-stats"        → "/legend-stats/index.html"        (스냅샷 있음 → 그대로 서빙)
//   "/history-mode/legend" → "/history-mode/legend/index.html"
//   "/notice/123"          → "/notice/123/index.html"          (없음 → 404 → 기존 SPA fallback)
//   "/assets/index-x.js"   → 그대로 (확장자가 있으면 건드리지 않는다)
//   "/sitemap.xml"         → 그대로
//
//   prerender 대상이 아닌 경로는 여전히 SPA fallback 으로 넘어가므로 기존 동작이 깨지지 않는다.
//   따라서 CloudFront 의 커스텀 오류 응답(404/403 → /index.html, 200) 설정은 그대로 둬야 한다.
//
// 배치
//   CloudFront 배포 E3TX8OFJBC8IML → 동작(Behavior) → 함수 연결 → 뷰어 요청
//
// 주의
//   CloudFront Functions 런타임 1.0 은 ES5.1 이라 endsWith/includes 가 없다.
//   아래는 그 제약에 맞춘 코드이므로 임의로 최신 문법으로 바꾸지 말 것.

function handler(event) {
    var request = event.request;
    var uri = request.uri;

    if (uri.charAt(uri.length - 1) === '/') {
        request.uri = uri + 'index.html';
    } else if (uri.lastIndexOf('.') <= uri.lastIndexOf('/')) {
        // 마지막 세그먼트에 확장자가 없다 = 파일이 아니라 라우트 경로다
        request.uri = uri + '/index.html';
    }

    return request;
}
