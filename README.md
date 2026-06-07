1. 프로젝트개요

-

2. 기술 스택

- (FE)Next.js > 기능 구현 후 각 컴포넌트로 분리 ( 유지보수 편리 및 가독성 증가 기대 )
- (FE)ts
- (FE)wagmi
- (FE)viem
- (FE)appkit - reown 대시보드 이용
- (FE)css > 추후 스타일시트 or scss 리팩토링 예정
- (BE)JAVA 17
- (BE)SpringBoot
- (DB)Postgresql
- (AWS) FE ( EC2 )
- (AWS) BE ( EC2 )
- (AWS) DB ( RDS )
- (CI/CD) Docker
- (WS) Nginx (DNS레코드 추가로 인해 Let's Encrypt를 활용했고 Certbot을 이용해 SSL 자동 갱신)

3. 주요 기능

- appkit을 이용한 로그인 (지갑주소로 로그인 및 구글 계정 or 애플 계정)
- 각 선물박스 마다 클릭하여 각각의 자원을 획득 ( 희토류 > 금 > 구리 = 망간 = 니켈 = 코발트, 박스마다 희소성에 따라 확률이 다르며 자원의 등장 갯수도 희소성에 따라 다름 )
- 자원으로 자체 발행 토큰으로 교환 ( 우선 tbnb로 테스트 예정 후 mainnet으로 변경 예정 )
- 자체 토큰으로 BSC 교환 가능 (추후 발행 예정)
- 로그인 기능 ( 지갑기반 ok 이메일 ok )

4. API 명세서

POST,/api/game/login,지갑 주소 기반 로그인 및 유저 초기화. 현재 자원 보유량 및 박스별 채굴 현황 데이터를 반환
POST,/api/game/stop, 앱 종료, 지갑 연결 해제, 또는 브라우저 이탈 시 현재까지의 채굴 진행률을 서버에 저장
POST,/api/game/claim, 채굴이 완료된 박스의 보상을 수령합니다. 서버 검증 후 자원 업데이트 및 다음 채굴 시작 시간을 반환
POST,/api/game/trade, 보유한 자원으로 자체 토큰으로 교환 ( 추가 예정 )
