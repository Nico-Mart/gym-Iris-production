using System;

namespace Backend_Gym_Iris.Exceptions
{
    public class ConflictException : Exception
    {
        public ConflictException(string message) : base(message) { }
    }
}
