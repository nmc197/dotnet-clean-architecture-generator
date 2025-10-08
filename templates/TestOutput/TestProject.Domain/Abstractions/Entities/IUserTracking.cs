namespace TestProject.Domain.Abstractions.Entities
{
    public interface IUserTracking
    {
        int? CreatedBy { get; set; }
        int? UpdatedBy { get; set; }
    }
}


