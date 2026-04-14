namespace finacc.DTOs;


public class AccountRequest
{
    // OrganizationId убран — извлекается из JWT-токена в контроллере
    public required string Name { get; set; }
    public required string AccountType { get; set; }
    public string? AccountNumber { get; set; } = null;
    public string? Description { get; set; } = null;
    public string? Currency { get; set; } = "RUB";
}
