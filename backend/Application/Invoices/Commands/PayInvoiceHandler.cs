using finacc.DataAccess;
using finacc.DTOs.Invoice;
using finacc.Models;
using finacc.Utility;
using finacc.Application.Invoices.Domain;
using finacc.Application.Services;

namespace finacc.Application.Invoices.Commands;

public class PayInvoiceHandler
{
    private readonly ApplicationDbContext _context;
    private readonly InvoicePaymentDataLoader _invoicePaymentDataLoader;
    private readonly BalanceService _balanceService;

    public PayInvoiceHandler(ApplicationDbContext context, BalanceService balanceService)
    {
        _context = context;
        _balanceService = balanceService;
        
        _invoicePaymentDataLoader = new InvoicePaymentDataLoader(context);
    }

    public async Task<Result<InvoiceResponse>> Handle(InvoicePaymentRequest request)
    {
        // Load invoice data
        var paymentDataResult = await _invoicePaymentDataLoader.Load(request);
        if (!paymentDataResult.IsSuccess)
        {
            return Result<InvoiceResponse>.Failure(paymentDataResult.ErrorMessage, paymentDataResult.ErrorCode);
        }
        var paymentData = paymentDataResult.Data!;

        // get account balance
        var balanceResult = await _balanceService.GetBalance(paymentData.Account.Id);
        if (!balanceResult.IsSuccess)
        {
            var errorMessage = "Не удалось получить данные о счете";
            return Result<InvoiceResponse>.Failure(errorMessage, balanceResult.ErrorCode);
        }

        // ensure can pay
        var paymentPolicyResult = InvoicePaymentPolicy.EnsureCanPay(paymentData.Invoice, request.Amount, balanceResult.Data!);
        if (!paymentPolicyResult.IsSuccess)
        {
            return Result<InvoiceResponse>.Failure(paymentPolicyResult.ErrorMessage, paymentPolicyResult.ErrorCode);
        }

        var transaction = new Transaction
        {
            OrganizationId = request.OrganizationId,
            AccountId = paymentData.Account.Id,
            CategoryId = paymentData.Invoice.CategoryId,
            TransactionType = paymentData.Invoice.InvoiceType,
            Counterparty = paymentData.Counterparty.Name,
            TransactionDate = request.PaymentDate ?? DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = request.Amount,
            Status = TransactionStatuses.InvoicePayment(paymentData.Invoice.Id),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Transactions.Add(transaction);

        paymentData.Invoice.RegisterPayment(request.Amount);

        await _context.SaveChangesAsync();

        return Result<InvoiceResponse>.Success(
            InvoiceMapper.ToResponse(paymentData.Invoice, paymentData.Account.Name, paymentData.Category.Name, paymentData.Category.CategoryType, paymentData.Counterparty.Name)
        );
    }
}