namespace finacc.DTOs;


public class AccountResponse
{
    public required int Id { get; set; }
    public required int OrganizationId { get; set; }
    public required string Name { get; set; }
    public required string AccountType { get; set; }
    public string? AccountNumber { get; set; } = null;
    public bool? IsActive { get; set; } = null;
    public DateTime? CreatedAt { get; set; } = null;
    public DateTime? UpdatedAt { get; set; } = null;
    public string? Description { get; set; } = null;
    public string? Currency { get; set; } = null;
}
