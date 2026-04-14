using Microsoft.EntityFrameworkCore;
using finacc.DataAccess;
using finacc.DTOs.Invoice;
using finacc.Utility;

namespace finacc.Application.Invoices.Data;

public class CreateInvoiceDataLoader
{
    private readonly ApplicationDbContext _context;

    public CreateInvoiceDataLoader(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CreateInvoiceData>> Load(int organizationId, CreateInvoiceRequest request)
    {
        var account = await _context.Accounts.FirstOrDefaultAsync(a =>
            a.Id == request.AccountId && a.OrganizationId == organizationId);
        if (account is null)
        {
            return Result<CreateInvoiceData>.Failure("Счёт не найден или не принадлежит организации", 404);
        }

        var category = await _context.Categories.FirstOrDefaultAsync(c =>
            c.Id == request.CategoryId &&
            (c.OrganizationId == organizationId || c.OrganizationId == null));
        if (category is null)
        {
            return Result<CreateInvoiceData>.Failure("Статья учёта не найдена", 404);
        }

        var counterparty = await _context.Counterparties.FirstOrDefaultAsync(c =>
            c.Id == request.CounterpartyId && c.OrganizationId == organizationId);
        if (counterparty is null)
        {
            return Result<CreateInvoiceData>.Failure("Контрагент не найден в организации", 404);
        }

        return Result<CreateInvoiceData>.Success(new CreateInvoiceData
        {
            Account = account,
            Category = category,
            Counterparty = counterparty
        });
    }
}