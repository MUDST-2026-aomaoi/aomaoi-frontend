import { runId, uniqueFullName } from '../../support/testData';

describe('Admin - worker management', () => {
  it('AD-WORKER-001 adds a worker', () => {
    cy.seedActiveAdminWithFarm().then(({ username, id }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/workers');

      const workerUsername = `e2e_wkr_${id}`;
      cy.getByTestID('worker-add-btn').click();
      cy.getByTestID('worker-form-fullname').clear().type(uniqueFullName('สมชาย'));
      cy.getByTestID('worker-form-nickname').clear().type(uniqueFullName('ชาย'));
      cy.getByTestID('worker-form-username').clear().type(workerUsername);
      cy.getByTestID('worker-form-phone').clear().type('0811111111');
      cy.getByTestID('worker-form-submit').click();

      cy.getByTestID('success-modal-message').should('contain', 'เพิ่มคนงานสำเร็จ');
      cy.getByTestID('success-modal-close').click();
      cy.getByTestID('worker-search').type(workerUsername);
      cy.getByTestID('worker-row').should('have.length', 1).and('contain', `@${workerUsername}`);
    });
  });

  it('AD-WORKER-002 validates the add-worker form', () => {
    cy.seedActiveAdminWithFarm().then(({ username }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/workers');
      cy.getByTestID('worker-add-btn').click();

      cy.getByTestID('worker-form-fullname').clear().type('Somchai1');
      cy.getByTestID('worker-form-nickname').clear().type('Chai2');
      cy.getByTestID('worker-form-username').clear().type('ab');
      cy.getByTestID('worker-form-phone').clear().type('081111111');
      cy.getByTestID('worker-form-temppw').clear().type('12345');
      cy.getByTestID('worker-form-submit').click();

      cy.contains('ชื่อ-นามสกุลต้องไม่มีตัวเลข');
      cy.contains('ชื่อเล่นต้องไม่มีตัวเลข');
      cy.contains('ต้องมีอย่างน้อย 3 ตัวอักษร');
      cy.contains('เบอร์โทรต้องเป็นตัวเลข 10 หลัก');
      cy.contains('ต้องมีอย่างน้อย 6 ตัวอักษร');
    });
  });

  it('AD-WORKER-003 rejects a username with a space', () => {
    cy.seedActiveAdminWithFarm().then(({ username, id }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/workers');
      cy.getByTestID('worker-add-btn').click();

      cy.getByTestID('worker-form-fullname').clear().type(uniqueFullName('สมชาย'));
      cy.getByTestID('worker-form-nickname').clear().type(uniqueFullName('ชาย'));
      cy.getByTestID('worker-form-username').clear().type(`e2e wkr ${id}`);
      cy.getByTestID('worker-form-phone').clear().type('0811111111');

      cy.window().then((win) => cy.stub(win, 'alert').as('alert'));
      cy.getByTestID('worker-form-submit').click();
      cy.get('@alert').should('have.been.calledWithMatch', /^Failed to add worker/);
    });
  });

  it('AD-WORKER-004 edits a worker', () => {
    cy.seedActiveAdminWithFarm().then(({ username, adminToken, id }) => {
      const workerUsername = `e2e_wkr_${id}`;
      cy.seedWorker({ fullName: uniqueFullName('สมชาย'), nickname: uniqueFullName('ชาย'), username: workerUsername, phone: '0811111111', tempPassword: 'Temp1234' }, adminToken);

      cy.loginSession(username, 'NewPass123');
      cy.visit('/workers');
      cy.getByTestID('worker-search').type(workerUsername);
      cy.getByTestID('worker-row').find('[data-test="worker-edit"]').click();
      cy.getByTestID('worker-form-nickname').clear().type('ชายใหม่');
      cy.getByTestID('worker-form-phone').clear().type('0822222222');
      cy.getByTestID('worker-form-submit').click();

      cy.getByTestID('success-modal-message').should('contain', 'แก้ไขข้อมูลสำเร็จ');
      cy.getByTestID('success-modal-close').click();
      cy.getByTestID('worker-row').should('contain', 'ชายใหม่').and('contain', '0822222222');
    });
  });

  it('AD-WORKER-005 resets a worker password', () => {
    cy.seedActiveAdminWithFarm().then(({ username, adminToken, id }) => {
      const workerUsername = `e2e_wkr_${id}`;
      cy.seedWorker({ fullName: uniqueFullName('สมชาย'), nickname: uniqueFullName('ชาย'), username: workerUsername, phone: '0811111111', tempPassword: 'Temp1234' }, adminToken).then(() =>
        cy.activateAccount(workerUsername, 'Temp1234')
      );

      cy.loginSession(username, 'NewPass123');
      cy.visit('/workers');
      cy.getByTestID('worker-search').type(workerUsername);
      cy.getByTestID('worker-row').find('[data-test="worker-edit"]').click();
      cy.getByTestID('worker-resetpw-toggle').click();

      cy.window().then((win) => cy.stub(win, 'alert').as('alert'));
      cy.getByTestID('worker-resetpw-input').type('Reset1234');
      cy.getByTestID('worker-resetpw-save').click();
      cy.get('@alert').should('have.been.calledWith', 'เปลี่ยนรหัสผ่านสำเร็จ!');

      cy.apiLogin(workerUsername, 'Reset1234').then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.user.isFirstLogin).to.eq(true);
      });
      cy.apiLogin(workerUsername, 'Temp1234').then((res) => {
        expect(res.status).to.eq(401);
      });
    });
  });

  it('AD-WORKER-006 rejects a reset password shorter than 6 chars', () => {
    cy.seedActiveAdminWithFarm().then(({ username, adminToken, id }) => {
      const workerUsername = `e2e_wkr_${id}`;
      cy.seedWorker({ fullName: uniqueFullName('สมชาย'), nickname: uniqueFullName('ชาย'), username: workerUsername, phone: '0811111111', tempPassword: 'Temp1234' }, adminToken);

      cy.loginSession(username, 'NewPass123');
      cy.visit('/workers');
      cy.getByTestID('worker-search').type(workerUsername);
      cy.getByTestID('worker-row').find('[data-test="worker-edit"]').click();
      cy.getByTestID('worker-resetpw-toggle').click();

      cy.window().then((win) => cy.stub(win, 'alert').as('alert'));
      cy.getByTestID('worker-resetpw-input').type('12345');
      cy.getByTestID('worker-resetpw-save').click();
      cy.get('@alert').should('have.been.calledWith', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');

      cy.apiLogin(workerUsername, 'Temp1234').then((res) => expect(res.status).to.eq(200));
    });
  });

  it('AD-WORKER-007 deletes a worker', () => {
    cy.seedActiveAdminWithFarm().then(({ username, adminToken, id }) => {
      const workerUsername = `e2e_wkr_${id}`;
      cy.seedWorker({ fullName: uniqueFullName('สมชาย'), nickname: uniqueFullName('ชาย'), username: workerUsername, phone: '0811111111', tempPassword: 'Temp1234' }, adminToken);

      cy.loginSession(username, 'NewPass123');
      cy.visit('/workers');
      cy.getByTestID('worker-search').type(workerUsername);
      cy.getByTestID('worker-row').find('[data-test="worker-delete"]').click();
      cy.getByTestID('worker-delete-confirm').click();

      cy.getByTestID('success-modal-message').should('contain', 'ลบคนงานสำเร็จ');
      cy.getByTestID('success-modal-close').click();
      cy.getByTestID('worker-row-status').should('contain', 'Inactive');
      cy.getByTestID('worker-row-manage').should('contain', '-');
    });
  });

  it('AD-WORKER-008 a deleted worker cannot log in', () => {
    cy.seedActiveAdminWithFarm().then(({ username, adminToken, id }) => {
      const workerUsername = `e2e_wkr_${id}`;
      cy.seedWorker({ fullName: uniqueFullName('สมชาย'), nickname: uniqueFullName('ชาย'), username: workerUsername, phone: '0811111111', tempPassword: 'Temp1234' }, adminToken).then((worker) =>
        cy.request({
          method: 'DELETE',
          url: `${Cypress.apiUrl}/workers/${worker.id}`,
          headers: { Authorization: `Bearer ${adminToken}` },
        })
      );

      cy.visit('/login');
      cy.getByTestID('login-username').type(workerUsername);
      cy.getByTestID('login-password').type('Temp1234');
      cy.getByTestID('login-submit').click();
      cy.getByTestID('login-error').should('be.visible');
      cy.location('pathname').should('eq', '/login');
    });
  });

  it('AD-WORKER-009 admin only sees workers from their own farm', () => {
    cy.seedActiveAdminWithFarm().then(({ username: usernameA, adminToken: tokenA, id: idA }) => {
      cy.seedActiveAdminWithFarm().then(({ adminToken: tokenB, id: idB }) => {
        const workerA = `e2e_wkr_a_${idA}`;
        const workerB = `e2e_wkr_b_${idB}`;
        cy.seedWorker({ fullName: uniqueFullName('สมชาย'), nickname: uniqueFullName('ก'), username: workerA, phone: '0811111111', tempPassword: 'Temp1234' }, tokenA);
        cy.seedWorker({ fullName: uniqueFullName('สมหมาย'), nickname: uniqueFullName('ข'), username: workerB, phone: '0811111112', tempPassword: 'Temp1234' }, tokenB);

        cy.loginSession(usernameA, 'NewPass123');
        cy.visit('/workers');
        cy.contains('[data-test="worker-row"]', `@${workerA}`);
        cy.contains('[data-test="worker-row"]', `@${workerB}`).should('not.exist');
      });
    });
  });

  it('AD-WORKER-010 search and status filter narrow the list', () => {
    cy.seedActiveAdminWithFarm().then(({ username, adminToken, id }) => {
      const pendingUsername = `e2e_wkr_p_${id}`;
      const inactiveUsername = `e2e_wkr_i_${id}`;
      cy.seedWorker({ fullName: uniqueFullName('สมชาย'), nickname: uniqueFullName('นก'), username: pendingUsername, phone: '0811111111', tempPassword: 'Temp1234' }, adminToken);
      cy.seedWorker({ fullName: uniqueFullName('สมหมาย'), nickname: uniqueFullName('หมู'), username: inactiveUsername, phone: '0811111112', tempPassword: 'Temp1234' }, adminToken).then((worker) =>
        cy.request({
          method: 'DELETE',
          url: `${Cypress.apiUrl}/workers/${worker.id}`,
          headers: { Authorization: `Bearer ${adminToken}` },
        })
      );

      cy.loginSession(username, 'NewPass123');
      cy.visit('/workers');
      cy.getByTestID('worker-search').type(inactiveUsername);
      cy.getByTestID('worker-row').should('have.length', 1).and('contain', inactiveUsername);

      cy.getByTestID('worker-search').clear();
      cy.getByTestID('worker-status-filter').click();
      cy.getByTestID('worker-status-filter-opt-inactive').click();
      cy.getByTestID('worker-row').should('have.length', 1).and('contain', 'Inactive');
    });
  });
});
