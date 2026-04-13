using finacc.DataAccess;
using finacc.DTOs;
using Microsoft.EntityFrameworkCore;
using finacc.Utility;

namespace finacc.Application.Invoices.Queries;

public class GetInvoicesByOrganizationHandler
{
    private readonly ApplicationDbContext _context;

    public GetInvoicesByOrganizationHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<InvoiceResponse>>> Handle(int organizationId)
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

        var counterpartyDict = await _context.Counterparties
            .Where(c => c.OrganizationId == organizationId)
            .ToDictionaryAsync(c => c.Id, c => c.Name);

        var responses = invoices.Select(i =>
        {
            accountDict.TryGetValue(i.AccountId, out var accountName);
            categoryDict.TryGetValue(i.CategoryId, out var category);
            counterpartyDict.TryGetValue(i.CounterpartyId, out var counterpartyName);

            return InvoiceMapper.ToResponse(i, accountName, category?.Name, category?.CategoryType, counterpartyName);
        }).ToList();

        return Result<List<InvoiceResponse>>.Success(responses);
    }
}
