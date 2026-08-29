import assert from 'node:assert/strict';
import { extraFieldKeys, extraFieldsForTemplate } from './cvTemplateExtras';

{
  const academic = extraFieldKeys('Academic / Research CV');
  assert.deepEqual(academic, ['researchInterests', 'publications', 'conferences', 'grants']);
}

{
  const functional = extraFieldsForTemplate('Skills-Based (Functional)');
  assert.equal(functional[0].kind, 'skillCategories');
}

{
  assert.ok(extraFieldKeys('Creative Portfolio').includes('projects'));
  assert.ok(extraFieldKeys('Executive Leadership').includes('boardMemberships'));
  assert.ok(extraFieldKeys('Graduate Starter CV').includes('activities'));
  assert.ok(extraFieldKeys('Internship / Industrial Attachment').includes('internships'));
  assert.ok(extraFieldKeys('Personal Brand CV').includes('speaking'));
  assert.ok(extraFieldKeys('Technical / Engineering CV').includes('projects'));
  assert.deepEqual(extraFieldKeys('Classic Professional'), []);
  assert.deepEqual(extraFieldKeys(undefined), []);
}

console.log('cvTemplateExtras.test.ts: ok');
