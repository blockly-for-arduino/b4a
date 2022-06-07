/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Arduino for math blocks.
 * @suppress {missingRequire}
 */
'use strict';


Arduino['math_number'] = function (block) {
  // Numeric value.
  const code = Number(block.getFieldValue('NUM'));
  const order = code >= 0 ? Arduino.ORDER_ATOMIC :
    Arduino.ORDER_UNARY_NEGATION;
  return [code, order];
};
