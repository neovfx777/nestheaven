#!/bin/bash

# Qaysi joydan ishga tushirilsa, o‘sha joyni oladi
START_DIR="$(pwd)"

# Fayllarni qidirish
find "$START_DIR" \
  -type d \( -name "node_modules" -o -name ".git" \) -prune \
  -o -type f -print
