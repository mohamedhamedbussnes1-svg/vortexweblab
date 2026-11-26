import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildChatLogEntry,
  createObjectDialogueSession,
  generateSmartArabicReply,
  WORLD_OBJECT_CHAT_INFO,
} from './conversation';
import { createInitialRomanceStates } from './rules';
import { createInitialDialogueSession } from './social';
import { WorldObjectChatKind } from './types';

test('all 13 world object categories open conversational dialogue sessions', () => {
  const kinds = Object.keys(WORLD_OBJECT_CHAT_INFO) as WorldObjectChatKind[];
  assert.equal(kinds.length, 13);

  for (const kind of kinds) {
    const session = createObjectDialogueSession(kind, `obj-${kind}`);
    assert.equal(session.targetType, 'world_object');
    assert.equal(session.objectKind, kind);
    assert.equal(session.speakerNameAr.length > 2, true);
    assert.equal(session.npcLineAr.length > 10, true);
  }
});

test('smart Arabic keyboard chat triggers hold-hand, accompany, board-car, and enrollment intents', () => {
  const sonSession = createInitialDialogueSession('household_son', 'home-son', {
    money: 5_000_000,
    reputation: 70,
    activeVehicleId: 'pickup',
    ownedApartmentIds: ['apt_hara'],
    spouseId: 'girl-sara',
    marriedDay: 1,
    marriageElapsedSec: 120,
    currentDay: 2,
    children: [{ id: 'c1', nameAr: 'كريم', gender: 'boy', shirtColor: 0x2563eb, happiness: 90 }],
    romanceStates: createInitialRomanceStates(),
  });

  const handReply = generateSmartArabicReply({
    session: sonSession,
    playerMessage: 'امسك إيدي يا بطل وتعالى معايا',
    playerNameAr: 'المعلم محمد حامد',
  });
  assert.equal(handReply.effect, 'hold_son_hand');
  assert.equal(handReply.animPose, 'hold_hand');

  const boardReply = generateSmartArabicReply({
    session: sonSession,
    playerMessage: 'يلا اركب العربية النصف نقل معانا',
    playerNameAr: 'المعلم محمد حامد',
  });
  assert.equal(boardReply.effect, 'board_vehicle');

  const gateSession = createObjectDialogueSession('school_gate', 'obj-school-gate');
  const gateReply = generateSmartArabicReply({
    session: gateSession,
    playerMessage: 'عاوز تقديم لابني وبنتي في مدرسة بنها الخاصة',
    playerNameAr: 'المعلم محمد حامد',
  });
  assert.equal(gateReply.effect, 'enroll_both');

  const adSession = createObjectDialogueSession('ad_board', 'obj-ad-board');
  const adReply = generateSmartArabicReply({
    session: adSession,
    playerMessage: 'اعلن خصم ٣٠ في المية دلوقتي',
    playerNameAr: 'المعلم محمد حامد',
  });
  assert.equal(adReply.effect, 'boost_ad_promo');

  const entry = buildChatLogEntry('المعلم محمد حامد', 'السلام عليكم', true, '09:00');
  assert.equal(entry.isPlayer, true);
  assert.equal(entry.clockStr, '09:00');
});
