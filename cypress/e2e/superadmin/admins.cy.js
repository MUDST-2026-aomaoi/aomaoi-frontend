import { runId, uniqueFullName } from '../../support/testData';

function seedFarmForTest() {
  const id = runId();
  return cy.seedSuperadminToken().then((token) =>
    cy.seedFarm(`E2E Admin Farm ${id}`, 'นครปฐม', token).then((farm) => ({ farm, id }))
  );
}

describe('Superadmin - admin management', () => {
  beforeEach(() => {
    cy.loginSession('superadmin', '1234');
  });

  it('SA-ADMIN-001 adds an admin', () => {
    seedFarmForTest().then(({ farm, id }) => {
      cy.visit('/admins');
      cy.getByTestID('admin-add-btn').click();
      cy.getByTestID('admin-form-fullname').clear().type(uniqueFullName('สมหญิง'));
      cy.getByTestID('admin-form-username').clear().type(`e2e_adm_${id}`);
      cy.getByTestID('admin-form-phone').clear().type('0812345678');
      cy.getByTestID('admin-form-farm').click();
      cy.getByTestID(`admin-form-farm-opt-${farm.id}`).click();
      cy.getByTestID('admin-form-submit').click();

      cy.getByTestID('success-modal-message').should('contain', 'เพิ่ม Admin สำเร็จ');
      cy.getByTestID('success-modal-close').click();
      cy.getByTestID('admin-search').type(id);
      cy.getByTestID('admin-row').should('have.length', 1).and('contain', `e2e_adm_${id}`);
    });
  });

  it('SA-ADMIN-002 validates the add-admin form', () => {
    cy.visit('/admins');
    cy.getByTestID('admin-add-btn').click();
    cy.getByTestID('admin-form-fullname').clear().type('Admin1');
    cy.getByTestID('admin-form-username').clear();
    cy.getByTestID('admin-form-phone').clear().type('081234567');
    cy.getByTestID('admin-form-temppw').clear().type('12345');
    cy.getByTestID('admin-form-submit').click();

    cy.contains('ชื่อ-นามสกุลต้องไม่มีตัวเลข');
    cy.contains('เบอร์โทรต้องเป็นตัวเลข 10 หลัก');
    cy.contains('กรุณาเลือกฟาร์ม');
    cy.contains('ต้องมีอย่างน้อย 6 ตัวอักษร');
  });

  it('SA-ADMIN-003 rejects a duplicate username', () => {
    seedFarmForTest().then(({ farm, id }) => {
      const username = `e2e_adm_${id}`;
      cy.seedSuperadminToken().then((token) =>
        cy.seedAdmin(farm, { fullName: uniqueFullName('สมหญิง'), username, phone: '0812345678', tempPassword: 'Temp1234' }, token)
      );

      cy.visit('/admins');
      cy.getByTestID('admin-add-btn').click();
      cy.getByTestID('admin-form-fullname').clear().type(uniqueFullName('สมหญิง'));
      cy.getByTestID('admin-form-username').clear().type(username);
      cy.getByTestID('admin-form-phone').clear().type('0898765432');
      cy.getByTestID('admin-form-farm').click();
      cy.getByTestID(`admin-form-farm-opt-${farm.id}`).click();

      cy.on('window:alert', (msg) => expect(msg).to.match(/^Failed to add admin/));
      cy.getByTestID('admin-form-submit').click();

      cy.visit('/admins');
      cy.getByTestID('admin-search').type(id);
      cy.getByTestID('admin-row').should('have.length', 1);
    });
  });

  it('SA-ADMIN-004 edits an admin', () => {
    seedFarmForTest().then(({ farm, id }) => {
      cy.seedSuperadminToken().then((token) =>
        cy.seedAdmin(farm, { fullName: uniqueFullName('สมหญิง'), username: `e2e_adm_${id}`, phone: '0812345678', tempPassword: 'Temp1234' }, token)
      );

      cy.visit('/admins');
      cy.getByTestID('admin-search').type(id);
      cy.getByTestID('admin-row').find('[data-test="admin-edit"]').click();
      cy.getByTestID('admin-form-phone').clear().type('0898765432');
      cy.getByTestID('admin-form-submit').click();

      cy.getByTestID('success-modal-message').should('contain', 'แก้ไขข้อมูลสำเร็จ');
      cy.getByTestID('success-modal-close').click();
      cy.getByTestID('admin-row').should('contain', '0898765432');
    });
  });

  it('SA-ADMIN-005 deletes an admin', () => {
    seedFarmForTest().then(({ farm, id }) => {
      cy.seedSuperadminToken().then((token) =>
        cy.seedAdmin(farm, { fullName: uniqueFullName('สมหญิง'), username: `e2e_adm_${id}`, phone: '0812345678', tempPassword: 'Temp1234' }, token)
      );

      cy.visit('/admins');
      cy.getByTestID('admin-search').type(id);
      cy.getByTestID('admin-row').find('[data-test="admin-delete"]').click();
      cy.getByTestID('admin-delete-confirm').click();

      cy.getByTestID('success-modal-message').should('contain', 'ลบ Admin สำเร็จ');
      cy.getByTestID('success-modal-close').click();
      cy.getByTestID('admin-row-status').should('contain', 'Inactive');
      cy.getByTestID('admin-row-manage').should('contain', '-');
    });
  });

  it('SA-ADMIN-006 filters admins by farm', () => {
    seedFarmForTest().then(({ farm: farmA, id: idA }) => {
      seedFarmForTest().then(({ farm: farmB, id: idB }) => {
        cy.seedSuperadminToken().then((token) => {
          cy.seedAdmin(farmA, { fullName: uniqueFullName('แอดมิน'), username: `e2e_adm_a_${idA}`, phone: '0812345678', tempPassword: 'Temp1234' }, token);
          cy.seedAdmin(farmB, { fullName: uniqueFullName('แอดมิน'), username: `e2e_adm_b_${idB}`, phone: '0812345678', tempPassword: 'Temp1234' }, token);
        });

        cy.visit('/admins');
        cy.getByTestID('admin-farm-filter').click();
        cy.getByTestID(`admin-farm-filter-opt-${farmA.id}`).click();
        cy.getByTestID('admin-row').should('have.length', 1).and('contain', `e2e_adm_a_${idA}`);
      });
    });
  });

  it('SA-ADMIN-007 a deleted admin cannot log in', () => {
    seedFarmForTest().then(({ farm, id }) => {
      const username = `e2e_adm_${id}`;
      cy.seedSuperadminToken().then((token) =>
        cy
          .seedAdmin(farm, { fullName: uniqueFullName('สมหญิง'), username, phone: '0812345678', tempPassword: 'Temp1234' }, token)
          .then((admin) =>
            cy
              .request({
                method: 'DELETE',
                url: `${Cypress.apiUrl}/admins/${admin.id}`,
                headers: { Authorization: `Bearer ${token}` },
              })
          )
      );

      cy.visit('/login');
      cy.getByTestID('login-username').type(username);
      cy.getByTestID('login-password').type('Temp1234');
      cy.getByTestID('login-submit').click();
      cy.getByTestID('login-error').should('be.visible');
      cy.location('pathname').should('eq', '/login');
    });
  });
});
