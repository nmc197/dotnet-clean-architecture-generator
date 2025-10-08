using Microsoft.AspNetCore.Mvc;

namespace TestProject.WebAdmin.Controllers
{
    public class ProvinceController : Controller
    {
        public IActionResult List()
        {
            return View();
        }

        public IActionResult Detail(int id)
        {
            ViewBag.Id = id;
            return View();
        }

        public IActionResult Form(int? id)
        {
            ViewBag.Id = id;
            return View();
        }
    }
}


