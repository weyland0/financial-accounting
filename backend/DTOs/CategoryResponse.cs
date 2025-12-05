namespace finacc.DTOs;


public class CategoryResponse
{
    public required int CategoryId { get; set; }
    public required string Name { get; set; }
    public required string CategoryType { get; set; }
    public required string ActivityType { get; set; }
    public string? Description { get; set; }
    public int? OrganizationId { get; set; }
    public int? ParentId { get; set; }
}

