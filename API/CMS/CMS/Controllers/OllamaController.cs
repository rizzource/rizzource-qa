using CMS.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OllamaController : ControllerBase
    {
        private readonly OllamaService _ollama;

        public OllamaController(OllamaService ollama)
        {
            _ollama = ollama;
        }

        [HttpGet("ask")]
        public async Task<IActionResult> Ask([FromQuery] string q)
        {
            var resumeText = "Experienced frontend developer with 3+ years of hands-on experience building React applications...";
            var jobRole = "Law Associate";
            var jobDescription = @"We are seeking a 1L Law Associate to support litigation, legal research, document review, and case preparation.
Responsibilities include drafting memos, conducting case law research, preparing exhibits, reviewing contracts, and assisting senior attorneys in daily tasks.
Strong research, writing, attention to detail, and understanding of legal principles required.";
            var tone = "professional";

            var prompt = $@"Improve this resume for the job below. Do NOT add fake experience. Only rewrite and improve wording. 
Maintain a {tone} tone.
Resume:
{resumeText}
Job Description:
{jobDescription}";
            var reply = await _ollama.AskAsync(prompt);
            return Ok(reply);
        }
    }
}
