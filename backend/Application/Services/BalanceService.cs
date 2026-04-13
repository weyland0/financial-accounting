using Microsoft.EntityFrameworkCore;
using finacc.DataAccess;
using finacc.Models;
using finacc.Utility;

namespace finacc.Application.Services;

public class BalanceService
{
    private readonly ApplicationDbContext _context;

    public BalanceService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<decimal>> GetBalance(int accountId)
    {
        try {
            var totals = await _context.Transactions
                .Where(t => t.AccountId == accountId)
                .GroupBy(t => t.TransactionType)
                .Select(g => new { Type = g.Key, Total = g.Sum(t => (decimal?)t.Amount) ?? 0m })
                .ToListAsync();

            var income = totals.FirstOrDefault(x => x.Type == TransactionTypes.Income)?.Total ?? 0m;
            var expense = totals.FirstOrDefault(x => x.Type == TransactionTypes.Expense)?.Total ?? 0m;
            return Result<decimal>.Success(income - expense);
        } catch (Exception ex) {
            return Result<decimal>.Failure(ex.Message, 500);
        }
    }
}