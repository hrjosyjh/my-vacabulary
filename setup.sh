#!/bin/bash

# 색상 변수 설정
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 수능 영어 단어장 개발 환경 셋업${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. Node.js 및 npm 설치 확인
echo -e "\n${GREEN}[1/3] 환경 확인 중...${NC}"
if ! command -v node &> /dev/null
then
    echo -e "${RED}❌ Node.js가 설치되어 있지 않습니다.${NC}"
    echo "공식 홈페이지(https://nodejs.org/)에서 Node.js를 설치해주세요."
    exit 1
fi

if ! command -v npm &> /dev/null
then
    echo -e "${RED}❌ npm이 설치되어 있지 않습니다.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo "✅ Node.js 버전: $NODE_VERSION"
echo "✅ npm 버전: $NPM_VERSION"

# 2. 의존성 패키지 설치
echo -e "\n${GREEN}[2/3] 라이브러리 및 의존성 설치 중...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 의존성 설치 중 오류가 발생했습니다.${NC}"
    exit 1
fi

# 3. 빌드 테스트 (선택 사항)
echo -e "\n${GREEN}[3/3] 설치 검증 (빌드 테스트)...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${GREEN}✅ 셋업이 성공적으로 완료되었습니다!${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "\n다음 명령어로 개발 서버를 시작하세요:"
    echo -e "${GREEN}./setup.sh start${NC} 또는 ${GREEN}npm run dev${NC}\n"
else
    echo -e "${RED}❌ 빌드 테스트 실패. 설정을 확인해주세요.${RED}"
    exit 1
fi

# start 인자가 있으면 바로 실행
if [ "$1" == "start" ]; then
    npm run dev
fi
