namespace finacc.DTOs;

public class TransactionResponse
{
    public required int Id { get; set; }
    public required int OrganizationId { get; set; }
    public required int AccountId { get; set; }
    public required int CategoryId { get; set; }
    public required string TransactionType { get; set; }
    public string? Counterparty { get; set; }
    public required DateOnly TransactionDate { get; set; }
    public required decimal Amount { get; set; }
    public string? Status { get; set; }
    public string? AccountName { get; set; }
    public string? CategoryName { get; set; }
    public string? CategoryType { get; set; }
}

