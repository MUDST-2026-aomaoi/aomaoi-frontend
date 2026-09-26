import { runId } from '../../support/testData';

describe('Superadmin - farm management', () => {
  beforeEach(() => {
    cy.loginSession('superadmin', '1234');
    cy.visit('/farms');
  });

  it('SA-FARM-001 adds a farm', () => {
    const id = runId();
    const name = `E2E Farm ${id}`;

    cy.getByTestID('farm-add-btn').click();
    cy.getByTestID('farm-form-name').type(name);
    cy.getByTestID('farm-form-location').type('นครปฐม');
    cy.getByTestID('farm-form-submit').click();

    cy.getByTestID('success-modal-message').should('contain', 'เพิ่มฟาร์มสำเร็จ');
    cy.getByTestID('success-modal-close').click();
    cy.getByTestID('farm-search').type(id);
    cy.getByTestID('farm-card').should('have.length', 1).and('contain', name).and('contain', 'นครปฐม');
  });

  it('SA-FARM-002 blocks empty name/location', () => {
    cy.getByTestID('farm-add-btn').click();
    cy.getByTestID('farm-form-submit').click();
    cy.contains('กรุณากรอกชื่อฟาร์ม');
    cy.contains('กรุณากรอกที่ตั้ง');
  });

  it('SA-FARM-003 edits a farm', () => {
    const id = runId();
    const name = `E2E Farm ${id}`;

    cy.seedSuperadminToken().then((token) => cy.seedFarm(name, 'ราชบุรี', token));
    cy.visit('/farms');
    cy.getByTestID('farm-search').type(id);

    const newName = `E2E Farm Edited ${id}`;
    cy.getByTestID('farm-card').find('[data-test="farm-edit"]').click();
    cy.getByTestID('farm-form-name').clear().type(newName);
    cy.getByTestID('farm-form-location').clear().type('เพชรบุรี');
    cy.getByTestID('farm-form-submit').click();

    cy.getByTestID('success-modal-message').should('contain', 'แก้ไขข้อมูลสำเร็จ');
  });

  it('SA-FARM-004 deletes a farm', () => {
    const id = runId();
    const name = `E2E Farm ${id}`;

    cy.seedSuperadminToken().then((token) => cy.seedFarm(name, 'ราชบุรี', token));
    cy.visit('/farms');
    cy.getByTestID('farm-search').type(id);

    cy.getByTestID('farm-card').find('[data-test="farm-delete"]').click();
    cy.getByTestID('farm-delete-confirm').click();
    cy.getByTestID('success-modal-message').should('contain', 'ลบฟาร์มสำเร็จ');
    cy.getByTestID('success-modal-close').click();
    cy.getByTestID('farm-card').should('not.exist');
  });

  it('SA-FARM-005 filters farms by search', () => {
    const idA = runId();
    const idB = runId();

    cy.seedSuperadminToken().then((token) => {
      cy.seedFarm(`${idA}-a Farm`, 'A', token);
      cy.seedFarm(`${idB}-b Farm`, 'B', token);
    });
    cy.visit('/farms');
    cy.getByTestID('farm-search').type(`${idA}-a`);
    cy.getByTestID('farm-card').should('have.length', 1).and('contain', `${idA}-a`);
  });
});
