#!/bin/bash

find public/ packages/ -type f \( -name "*.php" -o -name "*.html" -o -name "*.fluid" -o -name "*.ts" -o -name "*.vhs" \) |
  entr -r ddev exec vendor/bin/typo3 cache:flush
