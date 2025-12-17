namespace finacc.DTOs;

public class InvoiceRequest
{
    public required int OrganizationId { get; set; }
    public required int AccountId { get; set; }
    public required int CategoryId { get; set; }
    public required int CounterpartyId { get; set; }
    public required string InvoiceType { get; set; } // INCOME | EXPENSE
    public required DateOnly InvoiceDate { get; set; }
    public required DateOnly PayUpDate { get; set; }
    public required decimal Amount { get; set; }
    public string? Status { get; set; }
}


