var diff = require('../')
var dedent = require('dedent-js')
var fs = require('fs')

var assert = require("nodeunit").assert

exports.testSimplePatch = function(test) {
  var str = dedent`
    diff --git file.txt file.txt
    index 83db48f..bf269f4 100644
    --- file.txt
    +++ file.txt
    @@ -1,3 +1,3 @@
     line1
    -line2
    +new line
     line3
  `

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: 'file.txt',
      newPath: 'file.txt',
      oldMode: '100644',
      newMode: '100644',
      status: 'modified',
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

exports.testNewPatch = function(test) {
  var str = dedent`
    diff --git file.txt file.txt
    new file mode 100644
    index 0000000..dab621c
    --- /dev/null
    +++ file.txt
    @@ -0,0 +1 @@
    +foo
  `

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: null,
      newPath: 'file.txt',
      oldMode: null,
      newMode: '100644',
      status: 'added',
      hunks: [
        {
          oldStartLine: 0,
          oldLineCount: 0,
          newStartLine: 1,
          newLineCount: 1,
          lines: ['+foo']
        }
      ]
    }
  ])
  test.done()
}

exports.testRemovedPatch = function(test) {
  var str = dedent`
    diff --git file.txt file.txt
    deleted file mode 100644
    index dab621c..0000000
    --- file.txt
    +++ /dev/null
    @@ -1 +0,0 @@
    -foo
  `

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: 'file.txt',
      newPath: null,
      oldMode: '100644',
      newMode: null,
      status: 'deleted',
      hunks: [
        {
          oldStartLine: 1,
          oldLineCount: 1,
          newStartLine: 0,
          newLineCount: 0,
          lines: ['-foo']
        }
      ]
    }
  ])
  test.done()
}

exports.testFileModeChange = function(test) {
  var str = dedent`
    diff --git file.txt file.txt
    old mode 100644
    new mode 100755
    index 83db48f..bf269f4
    --- file.txt
    +++ file.txt
    @@ -1,3 +1,3 @@
     line1
    -line2
    +new line
     line3
  `

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: 'file.txt',
      newPath: 'file.txt',
      oldMode: '100644',
      newMode: '100755',
      status: 'modified',
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
  var str = dedent`
    diff --git newfile.txt newfile.txt
    new file mode 100644
    index 0000000..e69de29
  `

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: null,
      newPath: 'newfile.txt',
      oldMode: null,
      newMode: '100644',
      hunks: [],
      status: 'added'
    }
  ])
  test.done()
}

exports.testSingleLineHunk = function(test) {
  var str = dedent`
    diff --git file.txt file.txt
    index 83db48f..bf269f4 100644
    --- file.txt
    +++ file.txt
    @@ -1 +1 @@
    -line1
    +line2
  `

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: 'file.txt',
      newPath: 'file.txt',
      oldMode: '100644',
      newMode: '100644',
      status: 'modified',
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
  var str = dedent`
    diff --git file.txt file.txt
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
     line9
  `

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: 'file.txt',
      newPath: 'file.txt',
      oldMode: '100644',
      newMode: '100644',
      status: 'modified',
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
  var str = dedent`
    diff --git file.txt file.txt
    index a999a0c..266014b 100644
    --- file.txt
    +++ file.txt
    @@ -1 +1 @@
    -line
    +line
    \ No newline at end of file
  `

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: 'file.txt',
      newPath: 'file.txt',
      oldMode: '100644',
      newMode: '100644',
      status: 'modified',
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
  var str = dedent`
    diff --git file.txt file.txt
    index 266014b..a999a0c 100644
    --- file.txt
    +++ file.txt
    @@ -1 +1 @@
    -line
    \ No newline at end of file
    +line
  `

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: 'file.txt',
      newPath: 'file.txt',
      oldMode: '100644',
      newMode: '100644',
      status: 'modified',
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
  var str = dedent`
    diff --git file.txt file.txt
    index 83db48f..bf269f4 100644
    --- file.txt
    +++ file.txt
    @@ -1,3 +1,3 @@
     line1
    -line2
    +
     line3
  `

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      oldPath: 'file.txt',
      newPath: 'file.txt',
      oldMode: '100644',
      newMode: '100644',
      status: 'modified',
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

exports.testMergeConflicts = function(test) {
  var str = dedent`
    diff --cc modified-on-both.txt
    index 5b7855c,1353022..0000000
    --- modified-on-both.txt
    +++ modified-on-both.txt
    @@@ -1,1 -1,1 +1,7 @@@
    ++<<<<<<< HEAD
     +master modification
    ++||||||| merged common ancestors
    ++text
    ++=======
    + branch modification
    ++>>>>>>> branch
    * Unmerged path removed-on-branch.txt
    * Unmerged path removed-on-master.txt
  `

  const output = diff.parse(str)
  assert.deepEqual(output, [
    {
      filePath: 'modified-on-both.txt',
      status: 'unmerged',
      hunks: [
        {
          ourStartLine: 1,
          ourLineCount: 1,
          baseStartLine: 1,
          baseLineCount: 1,
          theirStartLine: 1,
          theirLineCount: 7,
          lines: [
            '++<<<<<<< HEAD',
            ' +master modification',
            '++||||||| merged common ancestors',
            '++text',
            '++=======',
            '+ branch modification',
            '++>>>>>>> branch'
          ]
        }
      ]
    },
    {
      filePath: 'removed-on-branch.txt',
      status: 'unmerged'
    },
    {
      filePath: 'removed-on-master.txt',
      status: 'unmerged'
    }
  ])
  test.done()
}
