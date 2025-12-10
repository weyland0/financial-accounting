using finacc.DataAccess;
using finacc.DTOs;
using finacc.Models;
using Microsoft.EntityFrameworkCore;

namespace finacc.Services;

public interface ITransactionService
{
    Task<Result<TransactionResponse>> Create(TransactionRequest request);
    Task<Result<List<TransactionResponse>>> GetAllByOrganization(int organizationId);
}

public class TransactionService : ITransactionService
{
    private readonly ApplicationDbContext _context;

    public TransactionService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TransactionResponse>> Create(TransactionRequest request)
    {
        // Проверяем существование организации
        var orgExists = await _context.Organizations.AnyAsync(o => o.Id == request.OrganizationId);
        if (!orgExists)
        {
            return Result<TransactionResponse>.Failure("Организация не найдена", 404);
        }

        // Проверяем счет принадлежит организации
        var account = await _context.Accounts.FirstOrDefaultAsync(a =>
            a.Id == request.AccountId && a.OrganizationId == request.OrganizationId);
        if (account is null)
        {
            return Result<TransactionResponse>.Failure("Счет не найден или не принадлежит организации", 404);
        }

        // Проверяем категорию принадлежит организации или общая (OrganizationId null)
        var category = await _context.Categories.FirstOrDefaultAsync(c =>
            c.Id == request.CategoryId &&
            (c.OrganizationId == request.OrganizationId || c.OrganizationId == null));
        if (category is null)
        {
            return Result<TransactionResponse>.Failure("Статья учета не найдена", 404);
        }

        var transaction = new Transaction
        {
            OrganizationId = request.OrganizationId,
            AccountId = request.AccountId,
            CategoryId = request.CategoryId,
            TransactionType = request.TransactionType,
            Counterparty = request.Counterparty,
            TransactionDate = request.TransactionDate,
            Amount = request.Amount,
            Status = request.Status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        var response = MapToResponse(transaction, account.Name, category.Name, category.CategoryType);
        return Result<TransactionResponse>.Success(response);
    }

    public async Task<Result<List<TransactionResponse>>> GetAllByOrganization(int organizationId)
    {
        var orgExists = await _context.Organizations.AnyAsync(o => o.Id == organizationId);
        if (!orgExists)
        {
            return Result<List<TransactionResponse>>.Failure("Организация не найдена", 404);
        }

        var transactions = await _context.Transactions
            .Where(t => t.OrganizationId == organizationId)
            .OrderByDescending(t => t.TransactionDate)
            .ThenByDescending(t => t.Id)
            .ToListAsync();

        // Предзагружаем справочники в память
        var accountDict = await _context.Accounts
            .Where(a => a.OrganizationId == organizationId)
            .ToDictionaryAsync(a => a.Id, a => a.Name);

        var categoryDict = await _context.Categories
            .Where(c => c.OrganizationId == organizationId || c.OrganizationId == null)
            .ToDictionaryAsync(c => c.Id, c => new { c.Name, c.CategoryType });

        var responses = transactions.Select(t =>
        {
            categoryDict.TryGetValue(t.CategoryId, out var cat);
            accountDict.TryGetValue(t.AccountId, out var accName);
            return MapToResponse(t, accName, cat?.Name, cat?.CategoryType);
        }).ToList();

        return Result<List<TransactionResponse>>.Success(responses);
    }

    private static TransactionResponse MapToResponse(Transaction t, string? accountName, string? categoryName, string? categoryType)
    {
        return new TransactionResponse
        {
            Id = t.Id,
            OrganizationId = t.OrganizationId,
            AccountId = t.AccountId,
            CategoryId = t.CategoryId,
            TransactionType = t.TransactionType ?? "",
            Counterparty = t.Counterparty,
            TransactionDate = t.TransactionDate,
            Amount = t.Amount,
            Status = t.Status,
            AccountName = accountName,
            CategoryName = categoryName,
            CategoryType = categoryType
        };
    }
}

