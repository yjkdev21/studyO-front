<img width="100%" alt="image" src="https://github.com/user-attachments/assets/a9ea4511-2574-4ccd-a30b-593815f8be62" />


## 🚀 프로젝트 개요

StudyO는 **스터디(Study)와 스튜디오(Studio)를 결합한 올인원 협업 플랫폼**입니다.  
스터디 모집부터 활동, 팀 프로젝트까지 복잡한 과정을 손쉽게 관리하고 팀워크를 완성할 수 있습니다.

- **프로젝트명**: StudyO - 모든 스터디의 시작
- **개발기간**: 2025.07.14 - 2025.08.20 (5주)
- **팀구성**: 6명 (풀스택 6명)
- **배포 URL**: [www.studyo.r-e.kr/](https://www.studyo.r-e.kr/) _(2025년 10월까지 운영 예정)_
- **시연 영상**: [youtu.be/YQAbBxCMgDo](https://youtu.be/YQAbBxCMgDo)

<br/>

## 👥 팀 소개

| 김환희(팀장) | 김예지 | 백유선 | 윤고은 | 이재우 | 이현섭 |
|:----------:|:------:|:------:|:------:|:------:|:------:|
| UI/UX 디자인<br/>스터디 그룹 관리<br/>FullCalendar 연동 | UI/UX 디자인<br/>로그인 인증<br/>계정 관리<br/>멤버 승인/관리 | UI/UX 디자인<br/>스터디 그룹 CRUD<br/>AWS S3 연동<br/>썸네일 관리 | 회원가입 시스템<br/>필터링 기능<br/>추천 시스템 | 마이페이지<br/>프로필 수정<br/>공용 컴포넌트 | AWS 인프라<br/>CI/CD 구축<br/>홍보글 CRUD |

<br/>

## ✨ 주요 기능

### 📚 스터디 관리
- **스터디 모집**: 지역과 주제별 필터를 통한 효율적인 스터디 탐색
- **그룹 관리**: 스터디장 권한 기반 멤버 승인/거절 시스템
- **일정 관리**: FullCalendar를 활용한 직관적인 캘린더 인터페이스

### 👤 사용자 경험
- **간편한 시작**: 쉬운 가입과 로그인 과정
- **개인화**: 마이페이지에서 프로필 관리 및 활동 현황 확인
- **실시간 소통**: 스터디 후 팀 프로젝트로 자연스러운 전환

### 🎯 협업 도구
- **파일 관리**: AWS S3 기반 안전한 파일 업로드/다운로드
- **진행 관리**: 개인 할 일 관리 및 진척 상황 확인
- **홍보 시스템**: 풍부한 텍스트 에디터를 통한 스터디 홍보

<br/>

## 🛠 기술 스택

### Environment
![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=Visual%20Studio%20Code&logoColor=white)
![IntelliJ IDEA](https://img.shields.io/badge/IntelliJ_IDEA-000000?style=for-the-badge&logo=intellij-idea&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=Git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white)

### Frontend
![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

### Backend
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![MyBatis](https://img.shields.io/badge/MyBatis-271E1C?style=for-the-badge&logo=mybatis&logoColor=white)
![Lombok](https://img.shields.io/badge/Lombok-BC4521?style=for-the-badge&logo=lombok&logoColor=white)

### Database
![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-4479A1?style=for-the-badge&logo=sql&logoColor=white)

### Infrastructure
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Amazon EC2](https://img.shields.io/badge/Amazon%20EC2-FF9900?style=for-the-badge&logo=Amazon%20EC2&logoColor=white)
![Amazon S3](https://img.shields.io/badge/Amazon%20S3-569A31?style=for-the-badge&logo=Amazon%20S3&logoColor=white)

### Design & Cooperation
![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)
<br/>

## 🏗 시스템 아키텍처

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│             │    │              │    │             │
│   React     │◄──►│ Spring Boot  │◄──►│ Oracle 11g  │
│  Frontend   │    │   Backend    │    │  Database   │
│             │    │              │    │             │
└─────────────┘    └──────────────┘    └─────────────┘
       │                   │                   
       │                   │                   
       ▼                   ▼                   
┌─────────────┐    ┌──────────────┐           
│             │    │              │           
│   AWS S3    │    │   AWS EC2    │           
│File Storage │    │    Server    │           
│             │    │              │           
└─────────────┘    └──────────────┘           
```

<br/>

## 📂 프로젝트 구조

### Frontend (React)
```
react-study-o/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/     # 재사용 컴포넌트
│   ├── pages/         # 페이지 컴포넌트
│   ├── utils/         # 유틸리티 함수
│   ├── App.js         # 메인 앱 컴포넌트
│   └── index.js       # 엔트리 포인트
├── package.json
└── README.md
```

### Backend (Spring Boot)
```
tjspring/
├── src/main/java/com/tj/spring/
│   ├── admin/         # 관리자 기능
│   ├── auth/          # 인증/인가
│   ├── study/         # 스터디 관련
│   ├── user/          # 사용자 관리
│   └── common/        # 공통 기능
├── src/main/resources/
│   ├── mybatis/mapper/  # MyBatis 매퍼
│   ├── static/          # 정적 파일
│   └── application.properties
└── pom.xml
```

<br/>

## 🚀 시작하기

### 설치 및 실행

#### Frontend 실행
```bash
# 레포지토리 클론
git clone https://github.com/hyunsupLee/react-study-o.git
cd react-study-o

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

#### Oracle DB 접속정보 설정
1. 인텔리제이 우상단 configuration Edit
<img width="498" height="188" alt="Image" src="https://github.com/user-attachments/assets/81fed385-43e5-4eb5-8fda-89bf02cf435f" />


#### Oracle 환경변수 설정
2. Environment variables 환경변수에 DB 정보 설정
<img width="801" height="684" alt="Image" src="https://github.com/user-attachments/assets/725f3413-e863-4f60-8651-6843199e91a9" />


#### Backend 실행
```bash
# 레포지토리 클론
git clone https://github.com/hyunsupLee/tjspring.git
cd tjspring
```

<br/>

## 🎯 핵심 기능 상세

### 1. 권한 기반 스터디 관리
- 스터디장만 캘린더 등록/수정/삭제 권한
- 멤버 승인/거절 시스템
- 그룹별 권한 분리

### 2. 실시간 파일 관리
- AWS S3 연동을 통한 안전한 파일 저장
- 썸네일 자동 생성 및 최적화
- 파일 업로드/다운로드 진행률 표시

### 3. 직관적인 일정 관리
- FullCalendar 라이브러리 활용
- 드래그 앤 드롭으로 일정 수정
- 개인/그룹 일정 통합 관리

<br/>

## 📊 개발 프로세스

### Agile 방법론 적용
- **4주 스프린트**: 기획 → 개발 → 테스트 → 배포
- **일일 스탠드업**: 매일 진행 상황 공유
- **스프린트 리뷰**: 주간 피드백 및 개선사항 도출

### Git 워크플로우
- **브랜치 전략**: 개인 브랜치 → Main 브랜치
- **CI/CD**: GitHub Actions를 통한 자동 배포

<br/>

## 🔗 관련 링크

- **서비스 URL**: [StudyO](https://www.studyo.r-e.kr/)
- **Frontend Repository**: [react-study-o](https://github.com/hyunsupLee/react-study-o)
- **Backend Repository**: [tjspring](https://github.com/hyunsupLee/tjspring)
- **프로젝트 피그마**: [StudyO 디자인](https://www.figma.com/studyo-design)

<br/>

## 🎉 프로젝트 성과

### 기술적 성과
- **풀스택 개발**: 6명 모든 팀원이 각자 담당 기능을 프론트엔드부터 백엔드까지 완전 구현
- **클라우드 배포**: AWS 인프라를 활용한 실제 서비스 배포
- **팀 협업**: Git을 활용한 6명 규모의 효율적인 협업 경험

### 사용자 가치
- **편의성**: 스터디 모집부터 활동까지 원스톱 지원
- **효율성**: 직관적인 UI/UX로 학습 관리 시간 단축
- **확장성**: 스터디에서 프로젝트로 자연스러운 전환

---

<div align="center">
  <strong>StudyO - 모든 스터디의 시작</strong><br/>
  Study Together, Grow Together <br/>
       
---

README ⓒ [김환희](https://github.com/rlaksl) · [김예지](https://github.com/yjkdev21) · [백유선](https://github.com/yuseon4455)
  
</div>
