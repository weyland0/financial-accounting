namespace finacc.DTOs;

public class InvoicePaymentRequest
{
    public required int InvoiceId { get; set; }
    public required int OrganizationId { get; set; }
    public required int AccountId { get; set; }
    public required decimal Amount { get; set; }
}


