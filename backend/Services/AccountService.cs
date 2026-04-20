using finacc.DataAccess;
using finacc.DTOs.Account;
using finacc.Models;
using finacc.Utility;
using Microsoft.EntityFrameworkCore;

namespace finacc.Services;


public interface IAccountService
{
    Task<Result<AccountResponse>> Create(int organizationId, AccountRequest request);
    Task<Result<AccountResponse>> GetById(int id);
    Task<Result<List<AccountResponse>>> GetAllByOrganization(int orgId);
}


public class AccountService : IAccountService
{
    private readonly ApplicationDbContext _context;

    public AccountService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AccountResponse>> Create(int organizationId, AccountRequest request)
    {
        var account = new Account
        {
            OrganizationId = organizationId,
            Name = request.Name,
            AccountType = request.AccountType,
            AccountNumber = request.AccountNumber,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Description = request.Description,
            Currency = request.Currency
        };

        // Добавляем организацию в БД
        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();

        // Возвращаем ответ
        var response = await MapWithBalance(account);

        return Result<AccountResponse>.Success(response);
    }

    public async Task<Result<AccountResponse>> GetById(int id)
    {
        var account = await _context.Accounts.FirstOrDefaultAsync(acc => acc.Id == id);
        if (account is null)
        {
            return Result<AccountResponse>.Failure("Счет не найден", 404);
        }

        var response = await MapWithBalance(account);

        return Result<AccountResponse>.Success(response);
    }

    public async Task<Result<List<AccountResponse>>> GetAllByOrganization(int orgId)
    {
        List<Account> accounts = await _context.Accounts.Where(acc => acc.OrganizationId == orgId).ToListAsync();

        if (accounts.Count == 0)
        {
            return Result<List<AccountResponse>>.Success([]);
        }

        var accountIds = accounts.Select(a => a.Id).ToList();

        // Загружаем суммы всех транзакций одним запросом, группируем в памяти
        var totals = await _context.Transactions
            .Where(t => accountIds.Contains(t.AccountId))
            .GroupBy(t => new { t.AccountId, t.TransactionType })
            .Select(g => new { g.Key.AccountId, g.Key.TransactionType, Total = g.Sum(t => (decimal?)t.Amount) ?? 0m })
            .ToListAsync();

        var incomeByAccount = totals
            .Where(x => x.TransactionType == "INCOME")
            .ToDictionary(x => x.AccountId, x => x.Total);

        var expenseByAccount = totals
            .Where(x => x.TransactionType == "EXPENSE")
            .ToDictionary(x => x.AccountId, x => x.Total);

        var responses = accounts
            .Select(account =>
            {
                var income = incomeByAccount.GetValueOrDefault(account.Id, 0m);
                var expense = expenseByAccount.GetValueOrDefault(account.Id, 0m);
                return MapToResponse(account, income - expense);
            })
            .ToList();

        return Result<List<AccountResponse>>.Success(responses);
    }

    private async Task<AccountResponse> MapWithBalance(Account account)
    {
        // Считаем баланс как сумма INCOME - EXPENSE по счету
        var incomes = await _context.Transactions
            .Where(tr => tr.AccountId == account.Id && tr.TransactionType == "INCOME")
            .SumAsync(tr => (decimal?)tr.Amount) ?? 0m;

        var expenses = await _context.Transactions
            .Where(t => t.AccountId == account.Id && t.TransactionType == "EXPENSE")
            .SumAsync(t => (decimal?)t.Amount) ?? 0m;

        return MapToResponse(account, incomes - expenses);
    }

    private static AccountResponse MapToResponse(Account account, decimal balance)
    {
        return new AccountResponse
        {
            Id = account.Id,
            OrganizationId = account.OrganizationId,
            Name = account.Name,
            AccountType = account.AccountType,
            AccountNumber = account.AccountNumber,
            IsActive = account.IsActive,
            CreatedAt = account.CreatedAt,
            UpdatedAt = account.UpdatedAt,
            Description = account.Description,
            Currency = account.Currency,
            Balance = balance
        };
    }
}
