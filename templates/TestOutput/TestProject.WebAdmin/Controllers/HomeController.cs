using Microsoft.AspNetCore.Mvc;

namespace TestProject.WebAdmin.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}


