"""
Placeholder Image Generator for Story Scenes
간단한 텍스트가 있는 플레이스홀더 이미지 생성
"""

from PIL import Image, ImageDraw, ImageFont
import os

# 이미지 설정
WIDTH = 1920
HEIGHT = 1080
BACKGROUND_COLORS = {
    'intro': (20, 30, 48),      # 어두운 청색 (밤)
    'discovery': (48, 20, 20),  # 어두운 적색 (긴장)
    'confrontation': (48, 35, 20), # 어두운 주황 (대치)
    'ending_true': (20, 48, 35), # 어두운 녹색 (성공)
    'ending_false': (35, 35, 35), # 회색 (실패)
}

# 이미지 정의
IMAGES = [
    # Intro scenes
    ('intro_scene01.jpg', 'intro', '타워팰리스\n2024년 3월 15일 금요일'),
    ('intro_scene02.jpg', 'intro', '경찰 출동\n새벽 6시 30분'),
    ('intro_scene03.jpg', 'intro', '피해자 발견\n김민수 (45세)'),
    ('intro_scene04.jpg', 'intro', '사건 현장\n예리한 흉기에 의한 자상'),
    ('intro_scene05.jpg', 'intro', '수사 시작\n진실을 밝혀내라'),

    # Knife discovery
    ('knife_discovery01.jpg', 'discovery', '증거 발견\n서랍 속의 칼'),
    ('knife_discovery02.jpg', 'discovery', '혈흔 확인\n마르지 않은 핏자국'),
    ('knife_discovery03.jpg', 'discovery', '의문점\n왜 숨겼을까?'),

    # Confrontation
    ('confrontation01.jpg', 'confrontation', '증거 정리\n모든 단서가 모였다'),
    ('confrontation02.jpg', 'confrontation', '대치 국면\n결정적 질문'),

    # True ending
    ('ending_true01.jpg', 'ending_true', '진실 발견\n모든 증거 확보'),
    ('ending_true02.jpg', 'ending_true', '범인 자백\n사건 해결'),
    ('ending_true03.jpg', 'ending_true', '정의 구현\nTRUE ENDING'),

    # False ending
    ('ending_false01.jpg', 'ending_false', '증거 부족\n확신할 수 없다'),
    ('ending_false02.jpg', 'ending_false', '용의자 석방\n미제 사건'),
]

def create_placeholder(filename, category, text):
    """플레이스홀더 이미지 생성"""
    # 배경색
    bg_color = BACKGROUND_COLORS.get(category, (30, 30, 30))

    # 이미지 생성
    img = Image.new('RGB', (WIDTH, HEIGHT), bg_color)
    draw = ImageDraw.Draw(img)

    # 테두리
    border_color = tuple(min(c + 40, 255) for c in bg_color)
    draw.rectangle([20, 20, WIDTH-20, HEIGHT-20], outline=border_color, width=5)

    # 텍스트
    try:
        # 시스템 폰트 사용 (Windows)
        font_large = ImageFont.truetype("malgun.ttf", 80)
        font_small = ImageFont.truetype("malgun.ttf", 40)
    except:
        # 폰트 로드 실패 시 기본 폰트
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # 중앙 텍스트
    lines = text.split('\n')

    # 첫 번째 줄 (큰 글씨)
    bbox = draw.textbbox((0, 0), lines[0], font=font_large)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (WIDTH - text_width) // 2
    y = HEIGHT // 2 - text_height - 40
    draw.text((x, y), lines[0], fill=(255, 255, 255), font=font_large)

    # 두 번째 줄 (작은 글씨)
    if len(lines) > 1:
        bbox = draw.textbbox((0, 0), lines[1], font=font_small)
        text_width = bbox[2] - bbox[0]
        x = (WIDTH - text_width) // 2
        y = HEIGHT // 2 + 40
        draw.text((x, y), lines[1], fill=(200, 200, 200), font=font_small)

    # 하단 워터마크
    watermark = f"[PLACEHOLDER] {filename}"
    bbox = draw.textbbox((0, 0), watermark, font=font_small)
    text_width = bbox[2] - bbox[0]
    x = (WIDTH - text_width) // 2
    y = HEIGHT - 100
    draw.text((x, y), watermark, fill=(100, 100, 100), font=font_small)

    return img

def main():
    # 출력 디렉토리
    output_dir = os.path.join('..', 'cases', 'c001', 'images')
    os.makedirs(output_dir, exist_ok=True)

    print(f"Generating {len(IMAGES)} placeholder images...")

    for filename, category, text in IMAGES:
        output_path = os.path.join(output_dir, filename)
        img = create_placeholder(filename, category, text)
        img.save(output_path, quality=85)
        print(f"✓ {filename}")

    print(f"\n✅ All images saved to: {output_dir}")

if __name__ == '__main__':
    main()
