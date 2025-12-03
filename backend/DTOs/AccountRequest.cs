namespace finacc.DTOs;


public class AccountRequest
{
    public required int OrganizationId { get; set; }
    public required string Name { get; set; }
    public required string AccountType { get; set; }
    public string? AccountNumber { get; set; } = null;
    public string? Description { get; set; } = null;
    public string? Currency { get; set; } = "RUB";
}
