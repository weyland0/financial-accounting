namespace finacc.DTOs;

public class TransactionRequest
{
    public required int OrganizationId { get; set; }
    public required int AccountId { get; set; }
    public required int CategoryId { get; set; }
    public required string TransactionType { get; set; } // INCOME | EXPENSE
    public required DateOnly TransactionDate { get; set; }
    public required decimal Amount { get; set; }
    public string? Status { get; set; }
    public string? Counterparty { get; set; }
}

