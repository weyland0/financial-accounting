namespace finacc.DTOs.Category;


public class CreateCategoryRequest
{
    public required string Name { get; set; }
    public required string CategoryType { get; set; }
    public required string ActivityType { get; set; }
    public string? Description { get; set; }
    // OrganizationId убран — извлекается из JWT-токена в контроллере
    public int? ParentId { get; set; }
}