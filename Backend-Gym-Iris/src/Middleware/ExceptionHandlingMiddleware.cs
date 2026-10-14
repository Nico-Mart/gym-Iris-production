using System.Net;
using System.Text.Json;
using Backend_Gym_Iris.Exceptions;

namespace Backend_Gym_Iris.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            int statusCode = (int)HttpStatusCode.InternalServerError;
            string message = "An unexpected error occurred.";

            switch (exception)
            {
                case NotFoundException nf:
                    statusCode = (int)HttpStatusCode.NotFound;
                    message = nf.Message;
                    break;
                case ValidationException ve:
                    statusCode = (int)HttpStatusCode.BadRequest;
                    message = ve.Message;
                    break;
                case ConflictException ce:
                    statusCode = (int)HttpStatusCode.Conflict;
                    message = ce.Message;
                    break;
                case UnauthorizedException ue:
                    statusCode = (int)HttpStatusCode.Unauthorized;
                    message = ue.Message;
                    break;
                default:
                    message = exception.Message;
                    break;
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            var result = JsonSerializer.Serialize(new { message });
            return context.Response.WriteAsync(result);
        }
    }
}
