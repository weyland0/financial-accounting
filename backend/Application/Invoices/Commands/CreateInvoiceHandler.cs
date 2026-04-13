using finacc.Application.Invoices.Domain;
using finacc.DataAccess;
using finacc.DTOs;
using finacc.Models;
using finacc.Utility;

namespace finacc.Application.Invoices.Commands;

public class CreateInvoiceHandler
{
    private readonly ApplicationDbContext _context;
    private readonly InvoiceCreationDataLoader _invoiceCreationDataLoader;

    public CreateInvoiceHandler(ApplicationDbContext context)
    {
        _context = context;
        _invoiceCreationDataLoader = new InvoiceCreationDataLoader(context);
    }

    public async Task<Result<InvoiceResponse>> Handle(CreateInvoiceRequest request)
    {
        var creationDataResult = await _invoiceCreationDataLoader.Load(request);
        if (!creationDataResult.IsSuccess)
        {
            return Result<InvoiceResponse>.Failure(creationDataResult.ErrorMessage, creationDataResult.ErrorCode);
        }
        var creationData = creationDataResult.Data!;

        var creationPolicyResult = InvoiceCreationPolicy.EnsureCanCreate(request.Amount);
        if (!creationPolicyResult.IsSuccess)
        {
            return Result<InvoiceResponse>.Failure(creationPolicyResult.ErrorMessage, creationPolicyResult.ErrorCode);
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
            Status = request.Status ?? InvoiceStatuses.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        return Result<InvoiceResponse>.Success(
            InvoiceMapper.ToResponse(invoice, creationData.Account.Name, creationData.Category.Name, creationData.Category.CategoryType, creationData.Counterparty.Name));
    }
}
