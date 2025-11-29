using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace finacc.Models;


[Table("users")]
public class User
{
    [Key]
    [Column("user_id")]
    public int Id { get; set; }

    [Required]
    [Column("email")]
    public required string Email { get; set; }

    [Required]
    [Column("password_hash")]
    public required string PasswordHash { get; set; }

    [Required]
    [Column("full_name")]
    public required string FullName { get; set; }

    [Column("role_id")]
    public int? RoleId { get; set; }

    [Column("organization_id")]
    public int? OrganizationId { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }
}
