describe('Language switch', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage();
  });

  it('LANG-001 defaults to Thai, switches to English and remembers the choice', () => {
    cy.visit('/login');
    cy.getByTestID('login-submit').should('contain', 'เข้าสู่ระบบ');
    cy.contains('ชื่อผู้ใช้');

    cy.getByTestID('lang-en').click();
    cy.getByTestID('login-submit').should('contain', 'LOGIN');
    cy.contains('Sugarcane Farm Accounting Management');
    cy.get('html').should('have.attr', 'lang', 'en');

    cy.reload();
    cy.getByTestID('login-submit').should('contain', 'LOGIN');

    cy.getByTestID('lang-th').click();
    cy.getByTestID('login-submit').should('contain', 'เข้าสู่ระบบ');
    cy.get('html').should('have.attr', 'lang', 'th');
  });

  it('LANG-002 role names stay in English in Thai and English', () => {
    cy.seedActiveAdminWithFarm().then(({ username }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/dashboard');
      cy.contains('Admin');
      cy.getByTestID('lang-en').first().click();
      cy.contains('Admin');
      cy.contains('a', 'Workers');
      cy.getByTestID('lang-th').first().click();
      cy.contains('a', 'คนงาน');
      cy.contains('Admin');
    });
  });
});
