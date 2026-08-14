import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const html = fs.readFileSync(new URL('../public/fsm/studio/index.html', import.meta.url), 'utf8')

test('FSM Studio inline application script parses', () => {
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .filter(Boolean)

  assert.ok(scripts.length > 0)
  scripts.forEach((script) => new Function(script))
})

test('clinical run workspace exposes the expected controls once', () => {
  const ids = [
    'runWorkspace',
    'ovPrev',
    'ovNext',
    'ovMinusMin',
    'ovPlusMin',
    'ovPause',
    'ovAddNext',
    'ovQueueList',
    'ovQueueMeta',
  ]

  ids.forEach((id) => {
    assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, `${id} should be unique`)
  })

  assert.match(html, /function renderRunQueue\(\)/)
  assert.match(html, /function jumpRunStep\(index\)/)
  assert.match(html, /function addTemporaryRunStep\(\)/)
  assert.match(html, /function toggleRunPause\(\)/)
})

test('protocol library includes category grouping controls', () => {
  assert.match(html, /id="protocolCategoryFilters"/)
  assert.match(html, /function renderProtocolCategoryFilters\(src\)/)
  assert.match(html, /state\.protocolCategory !== 'all'/)
})

test('personal protocols support folders and executable protocol groups', () => {
  const ids = [
    'cpFolder',
    'cpGroup',
    'protocolFolderFilters',
    'newProtocolFolderBtn',
    'newProtocolGroupBtn',
  ]

  ids.forEach((id) => {
    assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, `${id} should be unique`)
  })

  assert.match(html, /protocol_group: groupVal/)
  assert.match(html, /function runProtocolGroup\(name, protocols\)/)
  assert.match(html, /data-run-group/)
})

test('mark mode exposes batch assignment, export, and delete operations', () => {
  const ids = [
    'protocolMarkModeBtn',
    'protocolBatchToolbar',
    'markVisibleProtocolsBtn',
    'moveMarkedFolderBtn',
    'assignMarkedGroupBtn',
    'exportMarkedProtocolsBtn',
    'deleteMarkedProtocolsBtn',
  ]

  ids.forEach((id) => {
    assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, `${id} should be unique`)
  })

  assert.match(html, /markedProtocolIds: new Set\(\)/)
  assert.match(html, /function bulkAssignProtocolLocation\(kind\)/)
  assert.match(html, /function deleteMarkedProtocols\(\)/)
})

test('known truncated Mode Bank names are normalized for comparison and display', () => {
  assert.match(html, /'Relax and Balanc': 'Relax and Balance'/)
  assert.match(html, /function correctedProtocolName\(value\)/)
  assert.match(html, /canonicalProtocolName\(value\)/)
})
