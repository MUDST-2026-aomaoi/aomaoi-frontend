import { salaryAdvanceRepository } from '../repository/salaryAdvanceRepository';

export const salaryAdvanceService = {
  getAllAdvances: async () => {
    const advances = await salaryAdvanceRepository.getAll();
    // The API keeps cancelled advances in the list; they no longer count toward balances.
    return advances.filter((a) => !a.cancelledAt);
  },

  addAdvance: async ({ workerId, advanceDate, type, amount, itemName }) => {
    const payload = {
      workerId: Number(workerId),
      advanceDate,
      type,
      amount: Number(amount),
    };
    if (type === 'GOODS') payload.itemName = itemName.trim();
    return await salaryAdvanceRepository.add(payload);
  },
};
