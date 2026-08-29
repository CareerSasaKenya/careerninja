import assert from 'node:assert/strict';
import { normalizeCVContent, toTemplateProps } from './cvContent';

{
  const normalized = normalizeCVContent({
    personal: { name: 'Jane Wanjiku', summary: 'Operations lead in Nairobi.' },
    experience: [
      {
        role: 'Operations Officer',
        company: 'ABC Ltd',
        startDate: 'Jan 2021',
        current: true,
        responsibilities: ['Ran daily dispatch'],
      },
    ],
    education: [{ degree: 'BCom', institution: 'UoN', dates: '2014 – 2018' }],
    skills: ['Excel', 'Reporting'],
    publications: ['A paper'],
  });

  assert.equal(normalized.personal.name, 'Jane Wanjiku');
  assert.equal(normalized.personal.profile, 'Operations lead in Nairobi.');
  assert.equal(normalized.personal.summary, 'Operations lead in Nairobi.');
  assert.equal(normalized.experience[0].jobTitle, 'Operations Officer');
  assert.equal(normalized.experience[0].dates, 'Jan 2021 – Present');
  assert.deepEqual(normalized.experience[0].details, ['Ran daily dispatch']);
  assert.deepEqual(normalized.publications, ['A paper']);
}

{
  const props = toTemplateProps({
    personal: { name: 'Jane', profile: 'Hello', title: 'Analyst', phone: '1', email: 'a@b.c', location: 'Nairobi' },
    skills: ['SQL'],
    experience: [{ jobTitle: 'Analyst', company: 'KCB', dates: '2020 – 2022', details: ['Built reports'] }],
    education: [{ degree: 'BSc', institution: 'KU', dates: '2016 – 2020' }],
  });

  assert.equal(props.name, 'Jane');
  assert.equal(props.summary, 'Hello');
  assert.equal(props.experience[0].role, 'Analyst');
  assert.equal(props.experience[0].jobTitle, 'Analyst');
  assert.deepEqual(props.experience[0].responsibilities, ['Built reports']);
  assert.equal(props.internships[0].role, 'Analyst');
}

{
  const empty = normalizeCVContent(null);
  assert.deepEqual(empty.skills, []);
  assert.deepEqual(empty.experience, []);
  assert.equal(empty.personal.name, '');
}

console.log('cvContent.test.ts: ok');
