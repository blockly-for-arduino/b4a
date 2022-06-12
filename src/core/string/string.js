/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Arduino for text blocks.
 */
'use strict';

Arduino['text_multiline'] = function (block) {
  let code = `"${getValue(block, 'TEXT', 'field_multilinetext').replace(/\n/g, '\\n')}"`;
  return [code, Arduino.ORDER_ATOMIC];
};

Arduino['text_length'] = function (block) {
  let code = getValue(block, 'TEXT', 'input_value');
  // if(code.match(/^"(\S*?)"$/))
  if (code.match(/^"(\S*?)"$/) != null) {
    code = `String(${code})`
  }

  return [code + '.length()', Arduino.ORDER_ATOMIC];
};