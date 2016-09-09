{
  function postProcessDiff (header, file_modes, patch) {
    let status
    if (file_modes.old_mode && !file_modes.new_mode) {
      return {
        newPath: null,
        oldPath: header.file_name,
        newMode: null,
        oldMode: file_modes.old_mode,
        hunks: patch ? patch.hunks : [],
        status: 'deleted'
      }
    } else if (!file_modes.old_mode && file_modes.new_mode) {
      return {
        oldPath: null,
        newPath: header.file_name,
        oldMode: null,
        newMode: file_modes.new_mode,
        hunks: patch ? patch.hunks : [],
        status: 'added'
      }
    } else if (file_modes.old_mode && file_modes.new_mode) {
      if (patch) {
        return {
          newPath: header.file_name,
          oldPath: header.file_name,
          oldMode: file_modes.old_mode,
          newMode: file_modes.new_mode,
          hunks: patch.hunks,
          status: 'modified'
        }
      } else {
        throw new Error('patch expected')
      }
    } else {
      throw new Error('file modes missing')
    }
  }
}

diffs
  = diffs:diff* { return diffs }

diff
  = header:diff_header_line file_modes:file_mode_section? patch:patch? { return postProcessDiff(header, file_modes, patch) }

patch
  = header:patch_header hunks:hunk+ {
    const oldName = header.old_file_name
    const newName = header.new_file_name
    return {
      oldPath: oldName !== '/dev/null' ? oldName : null,
      newPath: newName !== '/dev/null' ? newName : null,
      hunks
    }
  }

patch_header
  = '--- ' old_file_name:TEXT NL '+++ ' new_file_name:TEXT NL { return {old_file_name, new_file_name} }

hunk
  = header:hunk_header lines:hunk_line+ {
    return Object.assign({}, header, {
      lines: lines
    })
  }

hunk_header
  = '@@ -' old_range:hunk_range ' +' new_range:hunk_range ' @@' context:TEXT? NL {
    return {
      oldStartLine: old_range.start,
      oldLineCount: old_range.count,
      newStartLine: new_range.start,
      newLineCount: new_range.count
    }
  }

hunk_range
  = start:NUMBER ',' count:NUMBER { return {start, count} }
  / start:NUMBER                  { return {start, count: 1} }

hunk_line
  = chars:(('+' / '-' / ' ' / '\\') TEXT?) NL { return chars.join('') }

diff_header_line
  = 'diff ' options:TEXT_NO_SPACES ' ' file_name:file_name_str NL { return {file_name} }

file_name_str
  = str:TEXT { return str.substr(str.length/2 + 1) }

file_mode_section
  = explicit_file_modes:(new_or_deleted_file_mode / changed_file_modes)? index_file_modes:index_line? { return explicit_file_modes || index_file_modes }

new_or_deleted_file_mode
  = type:('new'/'deleted') ' file mode ' file_mode:TEXT NL {
    if (type === 'new') return {old_mode: null, new_mode: file_mode}
    else return {old_mode: file_mode, new_mode: null}
  }

changed_file_modes
  = 'old mode ' old_mode:TEXT NL 'new mode ' new_mode:TEXT NL { return {old_mode, new_mode} }

index_line
  = 'index ' TEXT_NO_SPACES ' ' file_mode:TEXT NL { return {old_mode: file_mode, new_mode: file_mode} }
  / 'index ' TEXT_NO_SPACES NL 



S   = [ \t]
NL  = ("\n" / "\r\n") / EOF
NLS = NL / S
EOF = !.
TEXT = chars:[^\r\n]+ { return chars.join('') }
TEXT_NO_SPACES = chars:[^ \t\r\n]+ { return chars.join('') }
NUMBER = chars:[0-9]+ { return parseInt(chars.join(''), 10) }
