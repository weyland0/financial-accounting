using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace finacc.Models;


[Table("organizations")]
public class Organization
{
    [Key]
    [Column("organization_id")]
    public int Id { get; set; }

    [Required]
    [Column("name")]
    public required string Name { get; set; }

    [Column("legal_entity_name")]
    public string? LegalEntityName { get; set; }

    [Column("registration_number")]
    public string? RegistrationNumber { get; set; }

    [Column("tax_id")]
    public string? TaxId { get; set; }

    [Column("full_address")]
    public string? FullAddress { get; set; }

    [Column("email")]
    public string? Email { get; set; }

    [Column("phone")]
    public string? Phone { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
}
