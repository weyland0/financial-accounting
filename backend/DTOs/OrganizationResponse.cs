namespace finacc.DTOs;


public class OrganizationResponse
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public string? LegalEntityName { get; set; }
    public string? RegistrationNumber { get; set; }
    public string? TaxId { get; set; }
    public string? FullAddress { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
