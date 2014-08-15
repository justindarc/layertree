#!/usr/bin/env node

/**
 * Firefox OS Layer Tree Utility
 *
 * Captures layer tree dumps from `adb logcat` and
 * outputs them to the console without log noise.
 *
 * Usage:
 *   $ ./layertree.js
 */

// Regular expression for finding layer tree dump
var delimiter = /^I\/Gecko\s+\(.+\)\:\sLayerManager\s\(.+\)/g;

// Current layer tree dump
var tree = null;

// Track number of layer tree dumps
var total = process.argv.length === 3 ? process.argv[2] : -1;
var count = 0;

// Start `adb logcat`
var logcat = require('child_process').spawn('adb', ['logcat']);

// Handle `adb logcat` output data
logcat.stdout.on('data', function(data) {
  var lines = data.toString().split('\n');

  lines.forEach(function(line) {
    if (line.indexOf('I/Gecko') !== 0) {
      return;
    }

    // Start layer tree capture
    if (!tree && delimiter.exec(line)) {
      tree = [line];
      return;
    }

    // Continue capturing layer tree
    if (tree) {

      // Dump layer tree to console
      if (delimiter.exec(line)) {
        console.log('******** BEGIN LAYER TREE ********');
        console.log(tree.join('\n'));
        console.log('********  END LAYER TREE  ********\n\n');

        count++;

        if (count >= total) {
          process.exit();
        }

        // Reset layer tree capture
        tree = [line];
        return;
      }

      // Add to current layer tree dump
      tree.push(line);
    }
  });
});

// Handle `adb logcat` termination
logcat.on('close', function(code) {
  console.log('[adb process exited with code ' + code + ']');
});