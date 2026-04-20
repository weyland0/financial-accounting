namespace finacc.DTOs.Transaction;

public class TransactionRequest
{
    // OrganizationId убран — извлекается из JWT-токена в контроллере
    public required int AccountId { get; set; }
    public required int CategoryId { get; set; }
    public required string TransactionType { get; set; } // INCOME | EXPENSE
    public required DateOnly TransactionDate { get; set; }
    public required decimal Amount { get; set; }
    public string? Status { get; set; }
    public string? Counterparty { get; set; }
}

