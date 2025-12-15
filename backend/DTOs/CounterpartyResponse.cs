namespace finacc.DTOs;

public class CounterpartyResponse
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required int OrganizationId { get; set; }
    public string? Type { get; set; }
    public string? Category { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
}

