import { runId, uniqueFullName } from '../../support/testData';

// Attendance is only recorded for "today" in the business time zone (Asia/Bangkok), like the backend.
function isoDate(offsetDays = 0) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
  const d = new Date(`${today}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

// Admin of a fresh farm with `count` workers (all joined today).
function seedFarmWithWorkers(count = 2) {
  return cy.seedActiveAdminWithFarm().then((ctx) => {
    const workers = [];
    const seedOne = (i) => {
      if (i === count) return cy.wrap({ ...ctx, workers });
      return cy
        .seedWorker(
          { fullName: uniqueFullName('สมชาย'), nickname: uniqueFullName('ชาย'), username: `e2e_wkr_${ctx.id}_${i}`, phone: '0811111111', tempPassword: 'Temp1234' },
          ctx.adminToken
        )
        .then((worker) => {
          workers.push(worker);
          return seedOne(i + 1);
        });
    };
    return seedOne(0);
  });
}

const card = (worker) => cy.contains('[data-test="worker-row"]', worker.fullName);

function api(method, path, token, body) {
  return cy.request({
    method,
    url: `${Cypress.apiUrl}${path}`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
    failOnStatusCode: false,
  });
}

describe('Admin - attendance (มา / ลา / ขาด)', () => {
  // Today's attendance is locked after 18:00 Bangkok; the specs below edit today, so they only run while it is open.
  // (beforeEach, not before: the shared E2E run is created by the support file's beforeEach)
  beforeEach(function () {
    cy.request(`${Cypress.apiUrl}/test-support/e2e-readiness`).then((res) => {
      if (res.body.attendanceOpen === false) {
        cy.log('Attendance is closed (after 18:00 Bangkok): skipping');
        this.skip();
      }
    });
  });

  it('AD-ATT-001 marks present / absent / leave from the worker card and can clear it', () => {
    seedFarmWithWorkers(1).then(({ username, workers: [worker] }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/workers');

      cy.getByTestID('attendance-today').should('contain', 'วันนี้');
      cy.getByTestID('attendance-future-hint').should('not.exist');
      card(worker).within(() => {
        cy.getByTestID('attendance-unchecked').should('exist');
        cy.getByTestID('attendance-present').click();
        cy.getByTestID('attendance-present').should('have.attr', 'aria-pressed', 'true');
        cy.getByTestID('attendance-absent').click();
        cy.getByTestID('attendance-absent').should('have.attr', 'aria-pressed', 'true');
        cy.getByTestID('attendance-present').should('have.attr', 'aria-pressed', 'false');
        // pressing the selected status again clears the day
        cy.getByTestID('attendance-absent').click();
        cy.getByTestID('attendance-unchecked').should('exist');
        cy.getByTestID('attendance-leave').click();
      });

      cy.getByTestID('attendance-note').type('ป่วย โทรบอกเช้านี้');
      cy.getByTestID('attendance-note-confirm').click();
      card(worker).within(() => {
        cy.getByTestID('attendance-leave').should('have.attr', 'aria-pressed', 'true');
        cy.getByTestID('attendance-note-text').should('contain', 'ป่วย โทรบอกเช้านี้');
      });

      // it is stored, not just shown
      cy.reload();
      card(worker).within(() => {
        cy.getByTestID('attendance-leave').should('have.attr', 'aria-pressed', 'true');
        cy.getByTestID('attendance-note-text').should('contain', 'ป่วย โทรบอกเช้านี้');
      });
    });
  });

  it('AD-ATT-002 "ทุกคนมา" marks only the unchecked workers and keeps existing choices', () => {
    seedFarmWithWorkers(2).then(({ username, adminToken, workers: [first, second] }) => {
      cy.seedAttendance({ workerId: first.id, date: isoDate(), status: 'LEAVE', note: 'ลากิจ' }, adminToken);
      cy.loginSession(username, 'NewPass123');
      cy.visit('/workers');

      cy.getByTestID('attendance-count-LEAVE').should('have.text', '1');
      cy.getByTestID('attendance-count-unchecked').should('have.text', '1');
      cy.getByTestID('attendance-bulk-present').click();

      card(second).within(() => cy.getByTestID('attendance-present').should('have.attr', 'aria-pressed', 'true'));
      card(first).within(() => cy.getByTestID('attendance-leave').should('have.attr', 'aria-pressed', 'true'));
      cy.getByTestID('attendance-count-PRESENT').should('have.text', '1');
      cy.getByTestID('attendance-count-LEAVE').should('have.text', '1');
      cy.getByTestID('attendance-count-unchecked').should('have.text', '0');
      cy.getByTestID('attendance-bulk-present').should('be.disabled');
    });
  });

  it('AD-ATT-003 the summary tiles show the counts and filter the cards', () => {
    seedFarmWithWorkers(2).then(({ username, adminToken, workers: [first, second] }) => {
      cy.seedAttendance({ workerId: first.id, date: isoDate(), status: 'PRESENT' }, adminToken);
      cy.loginSession(username, 'NewPass123');
      cy.visit('/workers');

      cy.getByTestID('attendance-count-PRESENT').should('have.text', '1');
      cy.getByTestID('attendance-count-unchecked').should('have.text', '1');

      cy.getByTestID('attendance-stat-unchecked').click();
      cy.getByTestID('attendance-stat-unchecked').should('have.attr', 'aria-pressed', 'true');
      cy.getByTestID('worker-row').should('have.length', 1).and('contain', second.fullName);

      cy.getByTestID('attendance-stat-PRESENT').click();
      cy.getByTestID('worker-row').should('have.length', 1).and('contain', first.fullName);

      // pressing the selected tile again clears the filter
      cy.getByTestID('attendance-stat-PRESENT').click();
      cy.getByTestID('worker-row').should('have.length', 2);
    });
  });

  it('AD-ATT-004 API rules: past days are closed; a future day accepts only leave', () => {
    seedFarmWithWorkers(1).then(({ adminToken, workers: [worker] }) => {
      const put = (body) => api('PUT', '/attendance', adminToken, { workerId: worker.id, ...body });
      const tomorrow = isoDate(1);

      // the past can no longer be changed, whatever the status (or clearing)
      for (const date of [isoDate(-1), '2000-01-01']) {
        for (const status of ['PRESENT', 'ABSENT', 'LEAVE', null]) {
          put({ date, status }).its('status').should('eq', 400);
        }
      }
      // the future only takes leave
      put({ date: tomorrow, status: 'PRESENT' }).its('status').should('eq', 400);
      put({ date: tomorrow, status: 'ABSENT' }).its('status').should('eq', 400);
      put({ date: isoDate(), status: 'HOLIDAY' }).its('status').should('eq', 400);
      // "everyone present" is for today only
      for (const date of [isoDate(-1), tomorrow]) {
        api('POST', '/attendance/bulk-present', adminToken, { date }).its('status').should('eq', 400);
      }

      put({ date: tomorrow, status: 'LEAVE', note: 'แจ้งล่วงหน้า' }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.status).to.eq('LEAVE');
      });
      api('GET', `/attendance?date=${tomorrow}`, adminToken).its('body').should('have.length', 1);
      // cancelling the planned leave is allowed
      put({ date: tomorrow, status: null }).its('status').should('eq', 200);
      api('GET', `/attendance?date=${tomorrow}`, adminToken).its('body').should('have.length', 0);

      // today takes any status and can be cleared
      put({ date: isoDate(), status: 'LEAVE', note: 'โทรบอกเช้านี้' }).its('status').should('eq', 200);
      put({ date: isoDate(), status: null }).its('status').should('eq', 200);
    });
  });

  it('AD-ATT-005 API: workers, other farms and anonymous callers are rejected', () => {
    seedFarmWithWorkers(1).then(({ workers: [worker] }) => {
      cy.seedActiveAdminWithFarm().then(({ adminToken: otherAdminToken }) => {
        cy.activateAccount(worker.username, 'Temp1234').then(({ token: workerToken }) => {
          const body = { workerId: worker.id, date: isoDate(), status: 'PRESENT' };
          api('GET', `/attendance?date=${isoDate()}`, workerToken).its('status').should('eq', 403);
          api('PUT', '/attendance', workerToken, body).its('status').should('eq', 403);
          api('PUT', '/attendance', otherAdminToken, body).its('status').should('eq', 403);
          api('GET', `/attendance/worker/${worker.id}?month=${isoDate().slice(0, 7)}`, otherAdminToken).its('status').should('eq', 403);
          api('PUT', '/attendance', null, body).its('status').should('be.oneOf', [401, 403]);
        });
      });
    });
  });

  it('AD-ATT-006 clicking a card opens the worker detail page with the attendance calendar', () => {
    seedFarmWithWorkers(1).then(({ username, workers: [worker] }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/workers');
      card(worker).find('[data-test="worker-row-name"]').click();

      cy.location('pathname').should('eq', `/workers/${worker.id}`);
      cy.getByTestID('worker-detail-name').should('contain', worker.fullName);

      const today = isoDate();
      cy.get(`[data-test="attendance-day"][data-date="${today}"]`).should('have.attr', 'data-status', '').click();
      cy.getByTestID('attendance-absent').click();
      cy.get(`[data-test="attendance-day"][data-date="${today}"]`).should('have.attr', 'data-status', 'ABSENT');
      cy.getByTestID('attendance-month-summary').should('contain', 'ขาด 1');

      // past days are read-only history; today and later stay clickable
      cy.get('[data-test="attendance-day"]').each(($day) => {
        const date = $day.attr('data-date');
        if (date < today) expect($day).to.have.attr('disabled');
        else expect($day).not.to.have.attr('disabled');
      });

      cy.getByTestID('worker-detail-back').click();
      cy.location('pathname').should('eq', '/workers');
    });
  });

  it('AD-ATT-008 on the detail page a future day can only be marked as leave', () => {
    seedFarmWithWorkers(1).then(({ username, workers: [worker] }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit(`/workers/${worker.id}`);

      const tomorrow = isoDate(1);
      if (tomorrow.slice(0, 7) !== isoDate().slice(0, 7)) cy.getByTestID('attendance-next-month').click();
      cy.get(`[data-test="attendance-day"][data-date="${tomorrow}"]`).click();

      cy.getByTestID('attendance-present').should('be.disabled');
      cy.getByTestID('attendance-absent').should('be.disabled');
      cy.getByTestID('attendance-leave').should('not.be.disabled').click();
      cy.getByTestID('attendance-note').type('ลาล่วงหน้า');
      cy.getByTestID('attendance-note-confirm').click();

      cy.get(`[data-test="attendance-day"][data-date="${tomorrow}"]`).should('have.attr', 'data-status', 'LEAVE');

      // cancel it again by pressing the selected leave button
      cy.get(`[data-test="attendance-day"][data-date="${tomorrow}"]`).click();
      cy.getByTestID('attendance-leave').click();
      cy.get(`[data-test="attendance-day"][data-date="${tomorrow}"]`).should('have.attr', 'data-status', '');
    });
  });

  it('AD-ATT-009 after 18:00 Bangkok the cards and "ทุกคนมา" are locked and the page says so', () => {
    seedFarmWithWorkers(1).then(({ username, workers: [worker] }) => {
      cy.loginSession(username, 'NewPass123');
      // 18:30 Bangkok = 11:30 UTC; only Date is faked so the page's timers keep running
      cy.clock(Date.parse(`${isoDate()}T11:30:00Z`), ['Date']);
      cy.visit('/workers');

      cy.getByTestID('attendance-closed').should('exist');
      cy.getByTestID('attendance-bulk-present').should('be.disabled');
      card(worker).within(() => {
        cy.getByTestID('attendance-present').should('be.disabled');
        cy.getByTestID('attendance-leave').should('be.disabled');
        cy.getByTestID('attendance-absent').should('be.disabled');
      });
    });
  });

  it('AD-ATT-010 on the Workers page a later day can be picked but only leave can be registered', () => {
    seedFarmWithWorkers(2).then(({ username, adminToken, workers: [worker] }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/workers');

      const tomorrow = isoDate(1);
      cy.getByTestID('attendance-date').click();
      if (tomorrow.slice(0, 7) !== isoDate().slice(0, 7)) cy.get('.react-datepicker__navigation--next').click();
      cy.get(`.react-datepicker__day--0${tomorrow.slice(8)}:not(.react-datepicker__day--outside-month)`).click();

      cy.getByTestID('attendance-future-hint').should('exist');
      cy.getByTestID('attendance-back-today').should('exist');
      cy.getByTestID('attendance-bulk-present').should('be.disabled');
      card(worker).within(() => {
        cy.getByTestID('attendance-present').should('be.disabled');
        cy.getByTestID('attendance-absent').should('be.disabled');
        cy.getByTestID('attendance-leave').should('not.be.disabled').click();
      });
      cy.getByTestID('attendance-note').type('ลาล่วงหน้า');
      cy.getByTestID('attendance-note-confirm').click();
      card(worker).within(() => cy.getByTestID('attendance-leave').should('have.attr', 'aria-pressed', 'true'));
      api('GET', `/attendance?date=${tomorrow}`, adminToken).its('body').should('have.length', 1);

      // back to today: that leave belongs to tomorrow, so today is still unchecked
      cy.getByTestID('attendance-back-today').click();
      cy.getByTestID('attendance-today').should('exist');
      cy.getByTestID('attendance-future-hint').should('not.exist');
      card(worker).within(() => cy.getByTestID('attendance-unchecked').should('exist'));
    });
  });

  it('AD-ATT-007 an unknown worker shows a not-found message instead of crashing', () => {
    cy.seedActiveAdminWithFarm().then(({ username }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/workers/999999999');
      cy.getByTestID('worker-detail-missing').should('contain', 'ไม่พบคนงานนี้');
    });
  });
});
