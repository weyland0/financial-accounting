using Microsoft.EntityFrameworkCore;
using finacc.DataAccess;
using finacc.DTOs;
using finacc.Utility;

namespace finacc.Application.Invoices;

public class InvoiceCreationDataLoader
{
    private readonly ApplicationDbContext _context;

    public InvoiceCreationDataLoader(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<InvoiceCreationData>> Load(CreateInvoiceRequest request)
    {
        var account = await _context.Accounts.FirstOrDefaultAsync(a =>
            a.Id == request.AccountId && a.OrganizationId == request.OrganizationId);
        if (account is null)
        {
            return Result<InvoiceCreationData>.Failure("Счёт не найден или не принадлежит организации", 404);
        }

        var category = await _context.Categories.FirstOrDefaultAsync(c =>
            c.Id == request.CategoryId &&
            (c.OrganizationId == request.OrganizationId || c.OrganizationId == null));
        if (category is null)
        {
            return Result<InvoiceCreationData>.Failure("Статья учёта не найдена", 404);
        }

        var counterparty = await _context.Counterparties.FirstOrDefaultAsync(c =>
            c.Id == request.CounterpartyId && c.OrganizationId == request.OrganizationId);
        if (counterparty is null)
        {
            return Result<InvoiceCreationData>.Failure("Контрагент не найден в организации", 404);
        }

        return Result<InvoiceCreationData>.Success(new InvoiceCreationData
        {
            Account = account,
            Category = category,
            Counterparty = counterparty
        });
    }
}