namespace finacc.DTOs.Invoice;

public class InvoicePaymentRequest
{
    public required int InvoiceId { get; set; }
    public required int OrganizationId { get; set; }
    public required int AccountId { get; set; }
    public required decimal Amount { get; set; }
    public DateOnly? PaymentDate { get; set; }
}
