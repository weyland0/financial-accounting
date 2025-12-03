using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace finacc.Models;


[Table("accounts")]
public class Account
{
    [Key]
    [Column("account_id")]
    public int Id { get; set; }

    [Column("organization_id")]
    public required int OrganizationId { get; set; }

    [Required]
    [Column("name")]
    public required string Name { get; set; }

    [Column("account_type")]
    public required string AccountType { get; set; }

    [Column("account_number")]
    public string? AccountNumber { get; set; }

    [Column("is_active")]
    public bool? IsActive { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [Column("description")]
    public string? Description { get; set; }
    
    [Column("currency")]
    public string? Currency { get; set; }
}
