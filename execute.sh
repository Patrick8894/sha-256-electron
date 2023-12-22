#!/bin/bash

file_to_execute="dist/win-unpacked/hash-256-generator.exe"

if [ -f "$file_to_execute" ]; then
  ./"$file_to_execute" &
  exit
else
  echo "File '$file_to_execute' not found in the current directory."
  exit 1
fi