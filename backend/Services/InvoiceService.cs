using finacc.DataAccess;
using finacc.DTOs;
using finacc.Models;
using Microsoft.EntityFrameworkCore;

namespace finacc.Services;

public interface IInvoiceService
{
    Task<Result<InvoiceResponse>> Create(InvoiceRequest request);
    Task<Result<List<InvoiceResponse>>> GetAllByOrganization(int organizationId);
    Task<Result<InvoiceResponse>> Pay(InvoicePaymentRequest request);
}

public class InvoiceService : IInvoiceService
{
    private readonly ApplicationDbContext _context;

    public InvoiceService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<InvoiceResponse>> Create(InvoiceRequest request)
    {
        var orgExists = await _context.Organizations.AnyAsync(o => o.Id == request.OrganizationId);
        if (!orgExists)
        {
            return Result<InvoiceResponse>.Failure("Организация не найдена", 404);
        }

        var account = await _context.Accounts.FirstOrDefaultAsync(a =>
            a.Id == request.AccountId && a.OrganizationId == request.OrganizationId);
        if (account is null)
        {
            return Result<InvoiceResponse>.Failure("Счет не найден или не принадлежит организации", 404);
        }

        var category = await _context.Categories.FirstOrDefaultAsync(c =>
            c.Id == request.CategoryId &&
            (c.OrganizationId == request.OrganizationId || c.OrganizationId == null));
        if (category is null)
        {
            return Result<InvoiceResponse>.Failure("Статья учета не найдена", 404);
        }

        var counterparty = await _context.Counterparties.FirstOrDefaultAsync(c =>
            c.Id == request.CounterpartyId && c.OrganizationId == request.OrganizationId);
        if (counterparty is null)
        {
            return Result<InvoiceResponse>.Failure("Контрагент не найден в организации", 404);
        }

        var invoice = new Invoice
        {
            OrganizationId = request.OrganizationId,
            AccountId = request.AccountId,
            CategoryId = request.CategoryId,
            CounterpartyId = request.CounterpartyId,
            InvoiceType = request.InvoiceType,
            InvoiceDate = request.InvoiceDate,
            PayUpDate = request.PayUpDate,
            Amount = request.Amount,
            Status = request.Status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        var response = MapToResponse(invoice, account.Name, category.Name, category.CategoryType, counterparty.Name);
        return Result<InvoiceResponse>.Success(response);
    }

    public async Task<Result<List<InvoiceResponse>>> GetAllByOrganization(int organizationId)
    {
        var orgExists = await _context.Organizations.AnyAsync(o => o.Id == organizationId);
        if (!orgExists)
        {
            return Result<List<InvoiceResponse>>.Failure("Организация не найдена", 404);
        }

        var invoices = await _context.Invoices
            .Where(i => i.OrganizationId == organizationId)
            .OrderByDescending(i => i.InvoiceDate)
            .ThenByDescending(i => i.Id)
            .ToListAsync();

        var accountDict = await _context.Accounts
            .Where(a => a.OrganizationId == organizationId)
            .ToDictionaryAsync(a => a.Id, a => a.Name);

        var categoryDict = await _context.Categories
            .Where(c => c.OrganizationId == organizationId || c.OrganizationId == null)
            .ToDictionaryAsync(c => c.Id, c => new { c.Name, c.CategoryType });

        var counterpartiesDict = await _context.Counterparties
            .Where(c => c.OrganizationId == organizationId)
            .ToDictionaryAsync(c => c.Id, c => c.Name);

        var responses = invoices.Select(i =>
        {
            accountDict.TryGetValue(i.AccountId, out var accountName);
            categoryDict.TryGetValue(i.CategoryId, out var category);
            counterpartiesDict.TryGetValue(i.CounterpartyId, out var counterpartyName);

            return MapToResponse(i, accountName, category?.Name, category?.CategoryType, counterpartyName);
        }).ToList();

        return Result<List<InvoiceResponse>>.Success(responses);
    }

    public async Task<Result<InvoiceResponse>> Pay(InvoicePaymentRequest request)
    {
        if (request.Amount <= 0)
        {
            return Result<InvoiceResponse>.Failure("Сумма должна быть больше 0");
        }

        var invoice = await _context.Invoices
            .FirstOrDefaultAsync(i => i.Id == request.InvoiceId && i.OrganizationId == request.OrganizationId);
        if (invoice is null)
        {
            return Result<InvoiceResponse>.Failure("Счет не найден", 404);
        }

        var account = await _context.Accounts.FirstOrDefaultAsync(a =>
            a.Id == request.AccountId && a.OrganizationId == request.OrganizationId);
        if (account is null)
        {
            return Result<InvoiceResponse>.Failure("Счет не найден или не принадлежит организации", 404);
        }

        var category = await _context.Categories.FirstOrDefaultAsync(c =>
            c.Id == invoice.CategoryId &&
            (c.OrganizationId == request.OrganizationId || c.OrganizationId == null));
        if (category is null)
        {
            return Result<InvoiceResponse>.Failure("Статья учета не найдена", 404);
        }

        var counterparty = await _context.Counterparties.FirstOrDefaultAsync(c =>
            c.Id == invoice.CounterpartyId && c.OrganizationId == request.OrganizationId);
        if (counterparty is null)
        {
            return Result<InvoiceResponse>.Failure("Контрагент не найден", 404);
        }

        var remaining = invoice.Amount - invoice.PaidAmount;
        if (request.Amount > remaining)
        {
            return Result<InvoiceResponse>.Failure("Сумма оплаты превышает остаток по счету", 400);
        }

        // Проверяем баланс, если счет выставлен организации (расход)
        if ((invoice.InvoiceType ?? "").Equals("EXPENSE", StringComparison.OrdinalIgnoreCase))
        {
            var incomes = await _context.Transactions
                .Where(tr => tr.AccountId == account.Id && tr.TransactionType == "INCOME")
                .SumAsync(tr => (decimal?)tr.Amount) ?? 0m;

            var expenses = await _context.Transactions
                .Where(tr => tr.AccountId == account.Id && tr.TransactionType == "EXPENSE")
                .SumAsync(tr => (decimal?)tr.Amount) ?? 0m;

            var balance = incomes - expenses;
            if (balance < request.Amount)
            {
                return Result<InvoiceResponse>.Failure("Недостаточно средств на счете для оплаты", 400);
            }
        }

        // Создаем транзакцию оплаты
        var transaction = new Transaction
        {
            OrganizationId = request.OrganizationId,
            AccountId = account.Id,
            CategoryId = invoice.CategoryId,
            TransactionType = invoice.InvoiceType,
            Counterparty = counterparty.Name,
            TransactionDate = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = request.Amount,
            Status = $"Оплата счета #{invoice.Id}",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Transactions.Add(transaction);

        // Обновляем оплату счета
        invoice.PaidAmount += request.Amount;
        invoice.UpdatedAt = DateTime.UtcNow;

        var newRemaining = invoice.Amount - invoice.PaidAmount;
        if (newRemaining <= 0)
        {
            invoice.Status = "Оплачен";
        }
        else
        {
            invoice.Status = "Оплачен частично";
        }

        await _context.SaveChangesAsync();

        var response = MapToResponse(invoice, account.Name, category.Name, category.CategoryType, counterparty.Name);
        return Result<InvoiceResponse>.Success(response);
    }

    private static InvoiceResponse MapToResponse(
        Invoice invoice,
        string? accountName,
        string? categoryName,
        string? categoryType,
        string? counterpartyName)
    {
        return new InvoiceResponse
        {
            Id = invoice.Id,
            OrganizationId = invoice.OrganizationId,
            AccountId = invoice.AccountId,
            CategoryId = invoice.CategoryId,
            CounterpartyId = invoice.CounterpartyId,
            InvoiceType = invoice.InvoiceType ?? "",
            InvoiceDate = invoice.InvoiceDate,
            PayUpDate = invoice.PayUpDate,
            Amount = invoice.Amount,
            PaidAmount = invoice.PaidAmount,
            Status = invoice.Status,
            AccountName = accountName,
            CategoryName = categoryName,
            CategoryType = categoryType,
            CounterpartyName = counterpartyName
        };
    }
}


