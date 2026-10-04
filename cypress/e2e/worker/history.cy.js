import { runId, uniqueFullName } from '../../support/testData';

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function seedWorkerWithLogs() {
  const id = runId();
  const username = `e2e_wk_hist_${id}`;
  const fullName = uniqueFullName('คนงานประวัติ');
  
  return cy.seedActiveAdminWithFarm().then(({ adminToken }) => {
    return cy.seedWorker(
      { fullName, nickname: 'ประวัติ', username, phone: '0999999999', tempPassword: 'Password123' },
      adminToken
    ).then((worker) => {
      const today = getTodayString();
      // สร้างข้อมูลจำลอง
      cy.seedWorkLog({ type: 'planting', workerId: String(worker.id), date: today, furrows: 5, waPerFurrow: 20 }, adminToken);
      
      return cy.activateAccount(username, 'Password123').then(() => ({ worker, username }));
    });
  });
}

describe('Worker - History', () => {
  it('WK-HIST-001 Displays work logs in the history table', () => {
    seedWorkerWithLogs().then(({ username }) => {
      cy.loginSession(username, 'NewPass123');
      cy.visit('/history');

      // ตรวจสอบหัวตารางหรือ Title ของหน้า
      cy.contains('History').should('be.visible');

      // ตรวจสอบว่ามีข้อมูลงานที่บอทสร้างไว้โชว์ขึ้นมา (ปลูกอ้อย 5 ร่อง x 20 วา) = ยอด 250 บาท
      cy.contains('ปลูกอ้อย').should('be.visible');
      cy.contains('250').should('be.visible'); // ยอดเงิน
    });
  });
});
