using finacc.DataAccess;
using finacc.DTOs;
using finacc.Models;
using Microsoft.EntityFrameworkCore;

namespace finacc.Services;


public interface IAccountService
{
    Task<Result<AccountResponse>> Create(AccountRequest request);
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

    public async Task<Result<AccountResponse>> Create(AccountRequest request)
    {

        // Создаем новый счет
        var account = new Account
        {
            OrganizationId = request.OrganizationId,
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
        // Получаем орагнизацию
        Organization? org = await _context.Organizations.FindAsync(orgId);
        if (org is null)
        {
            return Result<List<AccountResponse>>.Failure("Организация не найдена", 404);
        }

        List<Account> accounts = await _context.Accounts.Where(acc => acc.OrganizationId == orgId).ToListAsync();
        if (accounts.Count == 0)
        {
            return Result<List<AccountResponse>>.Failure("Счета не найдены", 404);
        }

        var responses = new List<AccountResponse>();
        foreach (var account in accounts)
        {
            responses.Add(await MapWithBalance(account));
        }

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

        var balance = incomes - expenses;

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
