using finacc.DTOs.Invoice;
using finacc.Models;
namespace finacc.Application.Invoices;
public static class InvoiceMapper
{
    public static InvoiceResponse ToResponse(
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
