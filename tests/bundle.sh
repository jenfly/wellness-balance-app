#!/bin/sh
# Builds a single-file copy with SAMPLE data for the jsdom tests (the real app starts empty).
cd "$(dirname "$0")/.."
{ echo '<style>'; cat css/styles.css; echo '</style>'; sed -n '/<div id="app">/,/<div id="toast"/p' index.html; echo '<script>'; grep -v "^if (typeof module" js/logic.js; grep -v "^if (typeof module" tests/sample-data.js; sed 's/return emptyState();/return seed();/' js/ui.js; echo '</script>'; } > tests/balance-tiles.html
