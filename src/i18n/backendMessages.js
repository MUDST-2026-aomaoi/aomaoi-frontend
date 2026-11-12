import { t } from './index';

// Backend sends Thai messages. Known ones are mapped to keys so they follow the UI language;
// anything unknown is shown as-is.
const KNOWN = {
  'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง': 'err.badCredentials',
  'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้': 'err.network',
  'รหัสผ่านเดิมไม่ถูกต้อง': 'err.oldPasswordWrong',
  'ไม่พบผู้ใช้งานนี้ในระบบ': 'err.userNotFound',
  'วันสิ้นสุดต้องไม่อยู่ก่อนวันเริ่มต้น': 'err.endBeforeStart',
  'ไม่สามารถบันทึกงานในวันที่ยังไม่ถึงได้': 'err.futureDate',
};

export function translateBackendMessage(message) {
  const key = KNOWN[message];
  return key ? t(key) : message;
}

export function tError(error, fallback) {
  return translateBackendMessage(error?.response?.data?.message || error?.message || fallback);
}
