# 에이닷 내신 분석실 (세종아름)

강사·조교가 한 주소에서 안내를 보며 심화분석지·경향분석지를 만드는 정적 사이트입니다. 서버·DB 없음, 시험 데이터는 각자 브라우저와 다운로드 폴더에만 남습니다.

## 폴더
```
index.html            화면 구조 (탭: 안내 / 심화분석지 / 경향분석지 / 프롬프트)
assets/content.js     ★ 안내 문구·기준표·변경 기록·버전·프롬프트 본문 — 평소엔 이 파일만 고침
assets/hub.css        디자인
assets/hub.js         동작 (탭 이동, 진행 체크, 복사, 템플릿 띄우기)
tools/simhwa.html     심화분석지 템플릿 (원본 그대로)
tools/trend.html      경향분석지 템플릿 (원본 그대로)
downloads/            프롬프트 txt 등 받는 파일
```

## 배포 (GitHub Pages)
1. 이 폴더를 저장소에 올림 → Settings → Pages → Branch: main / root
2. 주소(https://<아이디>.github.io/<저장소>/)를 강사·조교에게 공유

## 업데이트할 때
- 템플릿 교체: `tools/simhwa.html` 덮어쓰기 → `content.js`의 `version.simhwa.ver` 올리기 → `changelog` 맨 위에 한 줄 추가
- 프롬프트 수정: `content.js`의 `prompt` 수정 + `downloads/`의 txt 교체 + `version.prompt`
- 안내 단계 수정: `content.js`의 `roles.asst.steps` / `roles.teacher.steps`
  - 표기: `[버튼 이름]` 버튼 모양, `` `파일 이름` `` 파일 모양, `**강조**` 형광펜

## 알아둘 점
- 템플릿의 자동 보관(localStorage)은 주소별로 따로입니다. 사이트에서 하던 작업은 사이트에서, 파일로 연 작업은 파일에서 이어집니다.
- 분석지 인쇄는 템플릿 안의 [인쇄] 버튼으로 합니다. 분석지 탭에서 Ctrl/Cmd+P를 눌러도 템플릿이 인쇄되도록 연결해 두었습니다(사이트 주소로 열었을 때).
- claude.ai 아티팩트로 올리면 저장(다운로드)·인쇄·확인창이 막혀 템플릿이 제대로 동작하지 않습니다. GitHub Pages 같은 일반 호스팅을 씁니다.
