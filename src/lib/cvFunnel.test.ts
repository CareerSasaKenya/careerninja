import assert from 'node:assert/strict';
import { buildPlaintextPdf, pdfLooksValid } from './cvPdf';
import {
  buildBuyerAndCartRows,
  isCvRelatedSku,
  leadKey,
  recentlyEmailed,
  skuForTemplateName,
  type FunnelEvent,
  type PaymentLite,
  type CvLite,
} from './cvFunnel';

{
  assert.equal(isCvRelatedSku('template.cv.classic-professional'), true);
  assert.equal(isCvRelatedSku('service.cv.writing'), true);
  assert.equal(isCvRelatedSku('template.cover-letter.classic-professional'), false);
  assert.equal(isCvRelatedSku('job.feature'), false);
  assert.equal(skuForTemplateName('Classic Professional'), 'template.cv.classic-professional');
  assert.equal(leadKey({ userId: 'u1', sku: 'template.cv.classic-professional' }), 'u1::sku:template.cv.classic-professional');
  console.log('✓ sku / lead key helpers');
}

{
  const payments: PaymentLite[] = [
    {
      id: 'pay-1',
      user_id: 'buyer-1',
      status: 'SUCCESS',
      amount: 350,
      phone_number: '254795564135',
      description: 'Classic Professional',
      metadata: { sku: 'template.cv.classic-professional' },
      paid_at: '2026-09-07T10:00:00.000Z',
      created_at: '2026-09-07T09:50:00.000Z',
    },
    {
      id: 'pay-2',
      user_id: 'cart-1',
      status: 'PENDING',
      amount: 750,
      phone_number: '254700000000',
      description: 'Creative Portfolio',
      metadata: { sku: 'template.cv.creative-portfolio' },
      paid_at: null,
      created_at: '2026-09-07T11:00:00.000Z',
    },
  ];
  const cvs: CvLite[] = [
    {
      id: 'cv-1',
      user_id: 'buyer-1',
      title: 'Jane CV',
      template_id: 'tpl-classic',
      file_url: 'https://example.com/jane.pdf',
      is_primary: true,
      last_emailed_at: '2026-09-07T10:05:00.000Z',
      created_at: '2026-09-07T10:02:00.000Z',
      updated_at: '2026-09-07T10:04:00.000Z',
    },
    {
      id: 'cv-2',
      user_id: 'editor-1',
      title: 'Draft CV',
      template_id: 'tpl-modern',
      file_url: null,
      is_primary: true,
      created_at: '2026-09-07T12:00:00.000Z',
      updated_at: '2026-09-07T12:30:00.000Z',
    },
  ];
  const events: FunnelEvent[] = [
    {
      user_id: 'chooser-1',
      action: 'chosen',
      sku: 'template.cv.executive-leadership',
      template_id: 'tpl-exec',
      template_name: 'Executive Leadership',
      cv_id: null,
      payment_id: null,
      created_at: '2026-09-07T13:00:00.000Z',
    },
    {
      user_id: 'editor-1',
      action: 'uploaded',
      sku: 'template.cv.modern-professional',
      template_id: 'tpl-modern',
      template_name: 'Modern Professional',
      cv_id: 'cv-2',
      payment_id: null,
      created_at: '2026-09-07T12:05:00.000Z',
    },
    {
      user_id: 'editor-1',
      action: 'edited',
      sku: 'template.cv.modern-professional',
      template_id: 'tpl-modern',
      template_name: 'Modern Professional',
      cv_id: 'cv-2',
      payment_id: null,
      created_at: '2026-09-07T12:30:00.000Z',
    },
  ];

  const { buyers, carts } = buildBuyerAndCartRows({
    payments,
    cvs,
    events,
    templates: [
      { id: 'tpl-classic', name: 'Classic Professional' },
      { id: 'tpl-modern', name: 'Modern Professional' },
      { id: 'tpl-exec', name: 'Executive Leadership' },
    ],
    profiles: [
      { id: 'buyer-1', full_name: 'Jane Wanjiku', phone: '0700' },
      { id: 'editor-1', full_name: 'Peter Otieno' },
      { id: 'chooser-1', full_name: 'Mary Achieng' },
    ],
    candidates: [{ id: 'c1', user_id: 'buyer-1', phone: '0700', full_name: 'Jane Wanjiku' }],
    documents: [
      {
        candidate_id: 'c1',
        file_url: 'https://example.com/profile-jane.pdf',
        candidate_cv_id: 'cv-1',
        document_name: 'Jane_CV.pdf',
      },
    ],
    emails: {
      'buyer-1': 'jane@email.com',
      'editor-1': 'peter@email.com',
      'chooser-1': 'mary@email.com',
      'cart-1': 'pending@email.com',
    },
  });

  assert.equal(buyers.length, 1);
  assert.equal(buyers[0].email, 'jane@email.com');
  assert.equal(buyers[0].cvTitle, 'Jane CV');
  assert.equal(buyers[0].profileDocumentUrl, 'https://example.com/profile-jane.pdf');
  assert.equal(buyers[0].kind, 'buyer');

  const cartUsers = carts.map((c) => c.userId).sort();
  assert.ok(cartUsers.includes('cart-1'));
  assert.ok(cartUsers.includes('editor-1'));
  assert.ok(cartUsers.includes('chooser-1'));
  assert.ok(!cartUsers.includes('buyer-1'));

  const editor = carts.find((c) => c.userId === 'editor-1');
  assert.ok(editor?.sources.includes('uploaded'));
  assert.ok(editor?.sources.includes('edited'));
  assert.equal(editor?.cvTitle, 'Draft CV');

  const chooser = carts.find((c) => c.userId === 'chooser-1');
  assert.ok(chooser?.sources.includes('chosen'));
  assert.equal(chooser?.productName, 'Executive Leadership');

  console.log('✓ buyers vs carts classification');
}

{
  assert.equal(recentlyEmailed(null), false);
  const recent = new Date(Date.now() - 60_000).toISOString();
  const old = new Date(Date.now() - 60 * 60_000).toISOString();
  assert.equal(recentlyEmailed(recent), true);
  assert.equal(recentlyEmailed(old), false);
  console.log('✓ email debounce');
}

{
  const bytes = buildPlaintextPdf('Jane Wanjiku\nOperations Lead\nNairobi\n\nKEY SKILLS\n• Excel', 'Jane CV');
  assert.ok(pdfLooksValid(bytes));
  assert.ok(bytes.length > 200);
  const asText = Buffer.from(bytes).toString('latin1');
  assert.match(asText, /Jane Wanjiku/);
  assert.match(asText, /%%EOF/);
  console.log('✓ plaintext PDF');
}
