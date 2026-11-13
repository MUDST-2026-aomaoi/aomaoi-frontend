import { attendanceRepository } from '../repository/attendanceRepository';

export const attendanceService = {
  getForDate: (date) => attendanceRepository.getForDate(date),
  set: (payload) => attendanceRepository.set(payload),
  bulkPresent: (date) => attendanceRepository.bulkPresent(date),
  getWorkerMonth: (workerId, month) => attendanceRepository.getWorkerMonth(workerId, month),
};
