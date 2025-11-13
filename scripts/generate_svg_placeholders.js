/**
 * SVG Placeholder Generator
 * Node.js로 간단한 SVG 플레이스홀더 생성
 */

const fs = require('fs');
const path = require('path');

const WIDTH = 1920;
const HEIGHT = 1080;

const BACKGROUND_COLORS = {
  intro: '#141e30',
  discovery: '#301414',
  confrontation: '#302314',
  ending_true: '#143023',
  ending_false: '#232323',
};

const IMAGES = [
  // Intro scenes
  ['intro_scene01.jpg', 'intro', '타워팰리스', '2024년 3월 15일 금요일'],
  ['intro_scene02.jpg', 'intro', '경찰 출동', '새벽 6시 30분'],
  ['intro_scene03.jpg', 'intro', '피해자 발견', '김민수 (45세)'],
  ['intro_scene04.jpg', 'intro', '사건 현장', '예리한 흉기에 의한 자상'],
  ['intro_scene05.jpg', 'intro', '수사 시작', '진실을 밝혀내라'],

  // Knife discovery
  ['knife_discovery01.jpg', 'discovery', '증거 발견', '서랍 속의 칼'],
  ['knife_discovery02.jpg', 'discovery', '혈흔 확인', '마르지 않은 핏자국'],
  ['knife_discovery03.jpg', 'discovery', '의문점', '왜 숨겼을까?'],

  // Confrontation
  ['confrontation01.jpg', 'confrontation', '증거 정리', '모든 단서가 모였다'],
  ['confrontation02.jpg', 'confrontation', '대치 국면', '결정적 질문'],

  // True ending
  ['ending_true01.jpg', 'ending_true', '진실 발견', '모든 증거 확보'],
  ['ending_true02.jpg', 'ending_true', '범인 자백', '사건 해결'],
  ['ending_true03.jpg', 'ending_true', '정의 구현', 'TRUE ENDING'],

  // False ending
  ['ending_false01.jpg', 'ending_false', '증거 부족', '확신할 수 없다'],
  ['ending_false02.jpg', 'ending_false', '용의자 석방', '미제 사건'],
];

function createSvgPlaceholder(filename, category, title, subtitle) {
  const bgColor = BACKGROUND_COLORS[category] || '#1e1e1e';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${bgColor}"/>

  <!-- Border -->
  <rect x="20" y="20" width="${WIDTH - 40}" height="${HEIGHT - 40}"
        fill="none" stroke="#ffffff40" stroke-width="5"/>

  <!-- Title -->
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 - 40}"
        font-family="Arial, sans-serif" font-size="80" font-weight="bold"
        fill="#ffffff" text-anchor="middle">${title}</text>

  <!-- Subtitle -->
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 60}"
        font-family="Arial, sans-serif" font-size="40"
        fill="#c8c8c8" text-anchor="middle">${subtitle}</text>

  <!-- Watermark -->
  <text x="${WIDTH / 2}" y="${HEIGHT - 60}"
        font-family="monospace" font-size="30"
        fill="#646464" text-anchor="middle">[PLACEHOLDER] ${filename}</text>
</svg>`;
}

function main() {
  const outputDir = path.join(__dirname, '..', 'cases', 'c001', 'images');

  // 디렉토리 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Generating ${IMAGES.length} SVG placeholder images...`);

  IMAGES.forEach(([filename, category, title, subtitle]) => {
    // SVG 파일명으로 변경 (.jpg -> .svg)
    const svgFilename = filename.replace('.jpg', '.svg');
    const outputPath = path.join(outputDir, svgFilename);

    const svg = createSvgPlaceholder(filename, category, title, subtitle);
    fs.writeFileSync(outputPath, svg, 'utf8');

    console.log(`✓ ${svgFilename}`);
  });

  console.log(`\n✅ All images saved to: ${outputDir}`);
  console.log('\n⚠️  Note: Story files reference .jpg, but SVG files were created.');
  console.log('   You may need to update story JSON files to use .svg extensions,');
  console.log('   OR convert these SVGs to JPG using an image converter.');
}

main();
