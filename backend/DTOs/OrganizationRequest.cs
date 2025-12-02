namespace finacc.DTOs;


public class OrganizationRequest
{
    public required string Name { get; set; }
    public string? LegalEntityName { get; set; } = null;
    public string? RegistrationNumber { get; set; } = null;
    public string? TaxId { get; set; } = null;
    public string? FullAddress { get; set; } = null;
    public string? Email { get; set; } = null;
    public string? Phone { get; set; } = null;
    public string? Industry { get; set; } = null;
}
