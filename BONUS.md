## Express your opinion about how to optimize your website in case that this website contains intensive data and when more people access, the lower speed you get?

### Redis Caching
- Concert listings are cached for 5 minutes, reducing database load significantly
- This allows the system to serve read-heavy traffic efficiently

### Add Rate Limiting
- Implement rate limiting per user/IP to prevent abuse
- Use Redis for distributed rate limiting across multiple API instances

### Database Optimization
- Add indexes on frequently queried fields (already have unique indexes)
- Consider partitioning the bookings table by date for very large datasets
- Use connection pooling with appropriate pool size

### Horizontal Scaling
- Run multiple API instances behind a load balancer (Nginx, AWS ALB, etc.)

---

## Express your opinion about how to handle when many users want to reserve the ticket at the same time? We want to ensure that in the concerts there is no one that needs to stand up during the show.

### Queue System (For Very High Load)
- Users submit booking requests, system processes them in order
- Prevents database overload and ensures fair first-come-first-served processing

### Race Conditions in Booking
- **Current Behavior**: The system uses database transactions, which help prevent race conditions
