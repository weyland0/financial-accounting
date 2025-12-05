namespace finacc.DTOs;


public class CategoryRequest
{
    public required string Name { get; set; }
    public required string CategoryType { get; set; }
    public required string ActivityType { get; set; }
    public string? Description { get; set; }
    public int? OrganizationId { get; set; }
    public int? ParentId { get; set; }
}