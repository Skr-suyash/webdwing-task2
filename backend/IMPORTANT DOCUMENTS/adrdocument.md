# Architecture Decision Record 

### 1. Database Choice

**Decision**: Use MongoDB as the primary database. 

**Reason**: Easy to integrate with mongoose and nodejs. Flexible ### 1. Database Choice

### 2. Authentication Framework

**Decision**: JWT Authentication

**Reason**: Stateless, easy to integrate with multiple services. Used to protect all sensitive routes

### 3. Schema Selection

**Decision**: Created three different scemas for Product, Transaction and User instead of merging into one

**Reason**: Clean and modular code which is easy to maintain

### 4. File Upload

**Decision**: Local upload instead of cloud or file storage platforms like Amazon S3.

**Reason**: Did not have much time to implement those

### 5. Security

**Decision**: Used CORS (Cross Origin Resouce Sharing) Middleware in express

**Reason**: Protects against common HTTP vulnerabilities and controls cross-origin access.

### 6. Rate Limiting

**Decision**: Used rate limiting 

**Reason**: To prevent DOS attacks on the server

### 7. Idempotency Check

**Decision**: Used a temporary mongodb collection to hold idempotency flag

**Reason**: To prevent unwanted and accidental POST requests

### 8. Mongoose Transaction Usage

**Decision**: Used to implement the checkout feature

**Reason**: If any one of the steps fail during the checkout do not make any changes to the DB and retrace all changes

### 9. Separate Transactions for Different Sellers

**Decision**: Create separate transaction records for each seller when a user buys products from multiple sellers in a single checkout.

**Reason**: Makes it easier for sellers to track their own orders and for the system to calculate seller-specific revenue, shipping, and commissions.

Simplifies refunds, disputes, and order tracking, as each transaction belongs to a single seller.

