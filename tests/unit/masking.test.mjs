import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MASK_TOKEN, maskContacts, offPlatformPaymentSignal } from '../../src/server/security/masking.js';

test('phone numbers are hidden in any common format', () => {
  for (const text of ['Call me on +254 712 002 210', 'my number 0712-002-210', 'US: (201) 555-0112', 'reach me at +256772000214']) {
    const result = maskContacts(text);
    assert.ok(result.redacted, text);
    assert.ok(result.text.includes(MASK_TOKEN), text);
    assert.doesNotMatch(result.text, /\d{3}.?\d{3}.?\d{3}/, text);
  }
});

test('emails and chat links are hidden', () => {
  assert.ok(maskContacts('write to kato.tours@gmail.com').redacted);
  assert.ok(maskContacts('ping me https://wa.me/256772000214').redacted);
  assert.ok(maskContacts('text me on @kato_tours').redacted);
});

test('prices, dates and plain talk are left alone', () => {
  for (const text of ['The price is KES 25,000 for the day', 'UGX 760K covers both days', 'See you on 12/10 at 6am', 'Land Cruiser, 7 seats, cold water']) {
    const result = maskContacts(text);
    assert.equal(result.redacted, false, text);
    assert.equal(result.text, text);
  }
});

test('requests to pay outside the platform are flagged', () => {
  assert.ok(offPlatformPaymentSignal('To confirm the booking send the deposit to my own MTN momo number before Friday.'));
  assert.ok(offPlatformPaymentSignal('Pay me directly and we avoid the fees'));
  assert.equal(offPlatformPaymentSignal('Can you do Saturday instead?'), false);
  assert.equal(offPlatformPaymentSignal('I will pay through Twendezetu once you send the offer'), false);
});
