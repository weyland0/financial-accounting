using Microsoft.EntityFrameworkCore;
using finacc.DataAccess;
using finacc.DTOs.Invoice;
using finacc.Utility;
namespace finacc.Application.Invoices;

public class InvoicePaymentDataLoader
{
    private readonly ApplicationDbContext _context;

    public InvoicePaymentDataLoader(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<InvoicePaymentData>> Load(InvoicePaymentRequest request)
    {
        var invoice = await _context.Invoices
            .FirstOrDefaultAsync(i => i.Id == request.InvoiceId && i.OrganizationId == request.OrganizationId);
        if (invoice is null)
        {
            return Result<InvoicePaymentData>.Failure("Счет не найден", 404);
        }

        var account = await _context.Accounts.FirstOrDefaultAsync(a =>
            a.Id == request.AccountId && a.OrganizationId == request.OrganizationId);
        if (account is null)
        {
            return Result<InvoicePaymentData>.Failure("Счёт не найден или не принадлежит организации", 404);
        }

        var category = await _context.Categories.FirstOrDefaultAsync(c =>
            c.Id == invoice.CategoryId &&
            (c.OrganizationId == request.OrganizationId || c.OrganizationId == null));
        if (category is null)
        {
            return Result<InvoicePaymentData>.Failure("Статья учёта не найдена", 404);
        }

        var counterparty = await _context.Counterparties.FirstOrDefaultAsync(c =>
            c.Id == invoice.CounterpartyId && c.OrganizationId == request.OrganizationId);
        if (counterparty is null)
        {
            return Result<InvoicePaymentData>.Failure("Контрагент не найден", 404);
        }

        return Result<InvoicePaymentData>.Success(new InvoicePaymentData
        {
            Invoice = invoice,
            Account = account,
            Category = category,
            Counterparty = counterparty
        });
    }
}