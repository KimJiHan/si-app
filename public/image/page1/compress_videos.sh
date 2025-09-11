#!/bin/bash

# 동영상 압축 스크립트
# H.264 코덱, 640px 너비, 24fps, 오디오 제거, 웹 스트리밍 최적화

echo "동영상 압축 시작..."

# 각 동영상 파일 압축
for video in seoul-ring2.mp4 dongdaemun-design-plaza2.mp4 nodeul-arts-island2.mp4 namsan-tower2.mp4 yongsan-business-district2.mp4 bukchon-hanok2.mp4; do
    echo "압축 중: $video"
    ffmpeg -i "original_backup/$video" \
        -c:v libx264 \
        -crf 28 \
        -vf "scale=640:-2" \
        -r 24 \
        -an \
        -movflags +faststart \
        -y \
        "$video"
done

echo "압축 완료!"
echo "압축 후 파일 크기:"
ls -lh *.mp4