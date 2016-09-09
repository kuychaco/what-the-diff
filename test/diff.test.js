var diff = require('../')
var fs = require('fs')

var assert = require("nodeunit").assert

exports.testSimplePatch = function(test) {
  var str = `diff --git file.txt file.txt
index 83db48f..bf269f4 100644
--- file.txt
+++ file.txt
@@ -1,3 +1,3 @@
 line1
-line2
+new line
 line3`

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: 'file.txt',
      newPath: 'file.txt',
      oldMode: '100644',
      newMode: '100644',
      hunks: [
        {
          oldStartLine: 1,
          oldLineCount: 3,
          newStartLine: 1,
          newLineCount: 3,
          lines: [
            ' line1',
            '-line2',
            '+new line',
            ' line3'
          ]
        }
      ]
    }
  ])
  test.done()
}

exports.testFileModeChange = function(test) {
  var str = `diff --git file.txt file.txt
old mode 100644
new mode 100755
index 83db48f..bf269f4
--- file.txt
+++ file.txt
@@ -1,3 +1,3 @@
 line1
-line2
+new line
 line3`

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: 'file.txt',
      newPath: 'file.txt',
      oldMode: '100644',
      newMode: '100755',
      hunks: [
        {
          oldStartLine: 1,
          oldLineCount: 3,
          newStartLine: 1,
          newLineCount: 3,
          lines: [
            ' line1',
            '-line2',
            '+new line',
            ' line3'
          ]
        }
      ]
    }
  ])
  test.done()
}

exports.testNewEmptyFile = function(test) {
  var str = `diff --git newfile.txt newfile.txt
new file mode 100644
index 0000000..e69de29`

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: null,
      newPath: 'newfile.txt',
      oldMode: null,
      newMode: '100644',
      hunks: []
    }
  ])
  test.done()
}

exports.testSingleLineHunk = function(test) {
  var str = `diff --git file.txt file.txt
index 83db48f..bf269f4 100644
--- file.txt
+++ file.txt
@@ -1 +1 @@
-line1
+line2`

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: 'file.txt',
      newPath: 'file.txt',
      oldMode: '100644',
      newMode: '100644',
      hunks: [
        {
          oldStartLine: 1,
          oldLineCount: 1,
          newStartLine: 1,
          newLineCount: 1,
          lines: [
            '-line1',
            '+line2'
          ]
        }
      ]
    }
  ])
  test.done()
}

exports.testMultipleHunks = function(test) {
  var str = `diff --git file.txt file.txt
index 83db48f..bf269f4 100644
--- file.txt
+++ file.txt
@@ -1,5 +1,4 @@
 line1
-line2
 line3
 line4
 line5
@@ -15,4 +14,5 @@
 line6
 line7
 line8
+line2
 line9`

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: 'file.txt',
      newPath: 'file.txt',
      oldMode: '100644',
      newMode: '100644',
      hunks: [
        {
          oldStartLine: 1,
          oldLineCount: 5,
          newStartLine: 1,
          newLineCount: 4,
          lines: [
            ' line1',
            '-line2',
            ' line3',
            ' line4',
            ' line5'
          ]
        },
        {
          oldStartLine: 15,
          oldLineCount: 4,
          newStartLine: 14,
          newLineCount: 5,
          lines: [
            ' line6',
            ' line7',
            ' line8',
            '+line2',
            ' line9'
          ]
        }
      ]
    }
  ])
  test.done()
}

exports.testRemovedEOFNL = function(test) {
  var str = `diff --git file.txt file.txt
index a999a0c..266014b 100644
--- file.txt
+++ file.txt
@@ -1 +1 @@
-line
+line
\ No newline at end of file`

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: 'file.txt',
      newPath: 'file.txt',
      oldMode: '100644',
      newMode: '100644',
      hunks: [
        {
          oldStartLine: 1,
          oldLineCount: 1,
          newStartLine: 1,
          newLineCount: 1,
          lines: [
            '-line',
            '+line',
            '\ No newline at end of file'
          ]
        }
      ]
    }
  ])
  test.done()
}

exports.testAddedEOFNL = function(test) {
  var str = `diff --git file.txt file.txt
index 266014b..a999a0c 100644
--- file.txt
+++ file.txt
@@ -1 +1 @@
-line
\ No newline at end of file
+line`

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: 'file.txt',
      newPath: 'file.txt',
      oldMode: '100644',
      newMode: '100644',
      hunks: [
        {
          oldStartLine: 1,
          oldLineCount: 1,
          newStartLine: 1,
          newLineCount: 1,
          lines: [
            '-line',
            '\ No newline at end of file',
            '+line'
          ]
        }
      ]
    }
  ])
  test.done()
}

exports.testEmptyHunkLine = function(test) {
  var str = `diff --git file.txt file.txt
index 83db48f..bf269f4 100644
--- file.txt
+++ file.txt
@@ -1,3 +1,3 @@
 line1
-line2
+
 line3`

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: 'file.txt',
      newPath: 'file.txt',
      oldMode: '100644',
      newMode: '100644',
      hunks: [
        {
          oldStartLine: 1,
          oldLineCount: 3,
          newStartLine: 1,
          newLineCount: 3,
          lines: [
            ' line1',
            '-line2',
            '+',
            ' line3'
          ]
        }
      ]
    }
  ])
  test.done()
}
