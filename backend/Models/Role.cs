using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace finacc.Models;


[Table("roles")]
public class Role
{
    [Key]
    [Column("role_id")]
    public int Id { get; set; }

    [Required]
    [Column("name")]
    public required string Name { get; set; }
}
