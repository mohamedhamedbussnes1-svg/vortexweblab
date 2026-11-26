import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildHamoYouTubeEmbedUrl,
  getHamoTrack,
  getNextHamoTrackIndex,
  getPrevHamoTrackIndex,
  HAMO_MORSHEDY_TRACKS,
  normalizeHamoTrackIndex,
} from './musicCatalog.ts';

test('Hamo El Morshedy track catalog wraps cleanly and builds continuous looping playlist URL', () => {
  assert.equal(HAMO_MORSHEDY_TRACKS.length >= 3, true);
  assert.equal(getHamoTrack(0).artistAr, 'حمو المرشدي');
  assert.equal(normalizeHamoTrackIndex(-1), HAMO_MORSHEDY_TRACKS.length - 1);
  assert.equal(getNextHamoTrackIndex(HAMO_MORSHEDY_TRACKS.length - 1), 0);
  assert.equal(getPrevHamoTrackIndex(0), HAMO_MORSHEDY_TRACKS.length - 1);

  const url = buildHamoYouTubeEmbedUrl(1, true);
  assert.equal(url.includes('youtube-nocookie.com/embed/0DqXwj7-QtY'), true);
  assert.equal(url.includes('autoplay=1'), true);
  assert.equal(url.includes('loop=1'), true);
  assert.equal(url.includes('NCpnxOXv7lE'), true);
  assert.equal(url.includes('aG0WSyaM09g'), true);
});
