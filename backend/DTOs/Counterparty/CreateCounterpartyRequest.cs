namespace finacc.DTOs.Counterparty;

public class CreateCounterpartyRequest
{
    // OrganizationId убран — извлекается из JWT-токена в контроллере
    public required string Name { get; set; }
    public string? Type { get; set; }
    public string? Category { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
}

