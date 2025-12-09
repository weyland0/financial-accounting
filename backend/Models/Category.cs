using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace finacc.Models;


[Table("categories")]
public class Categories
{
    [Key]
    [Column("category_id")]
    public int Id { get; set; }

    [Required]
    [Column("name")]
    public required string Name { get; set; }
    
    // Доходы/Расходы
    [Required]
    [Column("category_type")]
    public required string CategoryType { get; set; }

    // Операционная, финансовая и тд
    [Required]
    [Column("activity_type")]
    public required string ActivityType { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("organization_id")]
    public int? OrganizationId { get; set; }

    [Column("parent_id")]
    public int? ParentId { get; set; }
}