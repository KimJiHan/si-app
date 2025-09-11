#!/bin/bash

# GPT-OSS-20B Model Runner Script
# This script runs the GPT-OSS-20B model from your external drive

MODEL_PATH="/Volumes/PRO-G40/project/gpt-oss-20b"

echo "🤖 Starting GPT-OSS-20B Model..."
echo "Model location: $MODEL_PATH"

# Check if model exists
if [ ! -d "$MODEL_PATH" ]; then
    echo "❌ Error: Model directory not found at $MODEL_PATH"
    echo "Please ensure the model is downloaded and the external drive is connected."
    exit 1
fi

# Check if original folder exists
if [ ! -d "$MODEL_PATH/original" ]; then
    echo "❌ Error: Model files not found in $MODEL_PATH/original"
    echo "Model download may still be in progress."
    exit 1
fi

# Run the model
echo "✅ Model found. Starting chat interface..."
python -m gpt_oss.chat "$MODEL_PATH/original/"

echo "Chat session ended."