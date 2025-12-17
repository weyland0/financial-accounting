namespace finacc.DTOs;

public class InvoiceResponse
{
    public required int Id { get; set; }
    public required int OrganizationId { get; set; }
    public required int AccountId { get; set; }
    public required int CategoryId { get; set; }
    public required int CounterpartyId { get; set; }
    public required string InvoiceType { get; set; }
    public required DateOnly InvoiceDate { get; set; }
    public required DateOnly PayUpDate { get; set; }
    public required decimal Amount { get; set; }
    public string? Status { get; set; }
    public decimal PaidAmount { get; set; }

    public string? AccountName { get; set; }
    public string? CategoryName { get; set; }
    public string? CategoryType { get; set; }
    public string? CounterpartyName { get; set; }
}


