using System.Text.Json;
using System.Text;

namespace CMS.Services
{
    public class OllamaService
    {
        private readonly HttpClient _http;

        public OllamaService(HttpClient http)
        {
            _http = http;
        }

        public async Task<string> AskAsync(string prompt)
        {
            try
            {
                var request = new
                {
                    model = "gemma3:1b",
                    prompt = prompt,
                    stream = false
                };
                _http.Timeout = TimeSpan.FromSeconds(500);
                string json = JsonSerializer.Serialize(request);

                var response = await _http.PostAsync(
                    "/api/generate",
                    new StringContent(json, Encoding.UTF8, "application/json")
                );

                string resultJson = await response.Content.ReadAsStringAsync();

                var result = JsonSerializer.Deserialize<OllamaResponse>(resultJson);

                return result?.response ?? "No response";
            }
            catch (Exception ex) 
            {

            }
            return null;
        }
        public class OllamaResponse
        {
            public string model { get; set; }
            public DateTime created_at { get; set; }
            public string response { get; set; }
            public bool done { get; set; }
            public string done_reason { get; set; }
            public List<int> context { get; set; }
            public long total_duration { get; set; }
            public long load_duration { get; set; }
            public long prompt_eval_count { get; set; }
            public long prompt_eval_duration { get; set; }
            public int eval_count { get; set; }
            public long eval_duration { get; set; }

        }
    }
}
