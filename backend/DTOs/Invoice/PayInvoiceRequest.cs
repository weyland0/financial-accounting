namespace finacc.DTOs.Invoice;

public class PayInvoiceRequest
{
    // OrganizationId убран — извлекается из JWT-токена в контроллере
    public required int InvoiceId { get; set; }
    public required int AccountId { get; set; }
    public required decimal Amount { get; set; }
    public DateOnly? PaymentDate { get; set; }
}
