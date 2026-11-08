namespace Models
{
    public class PanicResponse
    {
        public PanicResponse(string message)
        {
            Message = message;
        }

        public string Message { get; set; }
    }
}