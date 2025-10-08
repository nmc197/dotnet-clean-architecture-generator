namespace TestProject.Domain.Abstractions.Entities
{
    public interface IEntityBase<TKey>
    {
        TKey Id { get; set; }
        bool IsDeleted { get; set; }
    }
}


