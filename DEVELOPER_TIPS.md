# 💡 Developer Tips & Best Practices

## 🎯 Before You Start Coding

### 1. Understand the Architecture
```
User (Browser)
    ↓
React Frontend (Port 3000)
    ↓ (HTTPS API Calls)
    ↓
Express Backend (Port 5000)
    ↓ (SQL Queries)
    ↓
PostgreSQL Database
    ↓ (Data Storage)
```

### 2. Key Design Patterns Used

**Context API** for state management
- Centralized auth state
- Easy to implement
- No external library needed

**Middleware** for request handling
- JWT verification
- Error handling
- Input validation

**Component Pattern** for UI
- Reusable components
- Composition over inheritance
- Single responsibility

### 3. Code Organization Principles
- One file per component
- Logical folder structure
- Clear naming conventions
- Consistent code style

---

## 🚀 Development Workflow

### Starting Development Session

```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start

# Terminal 3 - Database (if needed)
psql -U postgres
```

### Making Changes

**For Backend:**
1. Make changes to route files
2. Server auto-reloads (nodemon)
3. Test with Postman/curl
4. Check console for errors

**For Frontend:**
1. Make changes to React files
2. App auto-reloads (React)
3. Check browser console
4. Test API integration

---

## 🔍 Debugging Tips

### Frontend Debugging
```javascript
// Add console logs
console.log('Debug info:', data);

// Use React DevTools Chrome extension
// Use Redux DevTools (if using Redux)

// Check Network tab in browser
// View API requests and responses

// Check Application tab
// View localStorage tokens
```

### Backend Debugging
```javascript
// Add console logs
console.log('Request received:', req.body);

// Use debugger (add to server.js)
// node --inspect server.js

// Use VS Code debugger
// Set breakpoints in code

// Check database directly
// psql commands to verify data
```

### Database Debugging
```sql
-- Check data
SELECT * FROM exams;

-- Check relationships
SELECT * FROM exam_students WHERE exam_id = 1;

-- Check query performance
EXPLAIN ANALYZE SELECT ...;

-- View table structure
\d table_name;
```

---

## 📝 Common Development Tasks

### Adding a New Feature

**Step 1: Backend**
```javascript
// 1. Create route in backend/routes/newfeature.js
router.get('/endpoint', verifyToken, async (req, res) => {
  // Your logic here
});

// 2. Add to server.js
import newFeatureRoutes from './routes/newfeature.js';
app.use('/api/newfeature', newFeatureRoutes);

// 3. Test with curl/Postman
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/newfeature
```

**Step 2: Frontend API**
```javascript
// 1. Add to frontend/src/api/client.js
export const newFeatureAPI = {
  getAll: () => api.get('/newfeature'),
  create: (data) => api.post('/newfeature', data),
};

// 2. Create page component
// 3. Add route to App.js
// 4. Add menu item to Layout.js
```

**Step 3: Test**
```javascript
// Test in browser console
// 1. Login
// 2. Try the new feature
// 3. Check Network tab
// 4. Verify database changes
```

### Fixing a Bug

**Debug Steps:**
1. Reproduce the bug
2. Check browser console
3. Check server logs
4. Add console.logs
5. Check database
6. Review relevant code
7. Make fix
8. Test fix
9. Verify no regression

### Optimizing Performance

```javascript
// Frontend
// 1. Check React rendering
// React DevTools Profiler tab

// 2. Reduce API calls
// Use caching where appropriate

// 3. Optimize images
// Use appropriate sizes

// Backend
// 1. Add database indexes
// CREATE INDEX idx_name ON table(column);

// 2. Optimize queries
// Use EXPLAIN ANALYZE

// 3. Add pagination
// Limit query results

// Database
// 1. Regular VACUUM
// VACUUM table_name;

// 2. Regular ANALYZE
// ANALYZE table_name;
```

---

## 🧪 Testing Approaches

### Manual Testing Checklist
```
☐ Can register new user
☐ Can login with correct credentials
☐ Cannot login with wrong password
☐ Dashboard loads correctly
☐ Can create exam
☐ Can edit exam
☐ Can delete exam
☐ Can create classroom
☐ Can add students
☐ Can upload CSV
☐ Can run seating algorithm
☐ Can generate reports
☐ Can sort reports
☐ Can assign invigilators
☐ Responsive on mobile
☐ Works in Chrome
☐ Works in Firefox
```

### API Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"pass123","full_name":"Test User","role":"admin"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Store token in variable
TOKEN="your_token_here"

# Get exams (with token)
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/exams

# Create exam
curl -X POST http://localhost:5000/api/exams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"exam_date":"2024-01-15","exam_time_start":"10:00","exam_time_end":"12:00","subject_name":"Database","course_id":1,"semester":5}'
```

---

## 💼 Production Considerations

### Before Deploying

**Code Quality**
```
☐ No console.logs (or only important ones)
☐ No hardcoded values (use .env)
☐ Error handling on all endpoints
☐ Input validation on all inputs
☐ Commented out code removed
☐ All secrets in .env
```

**Performance**
```
☐ Database indexes added
☐ Queries optimized
☐ Frontend bundle minified
☐ Images optimized
☐ API response times < 1s
```

**Security**
```
☐ HTTPS/SSL enabled
☐ Rate limiting added
☐ CORS properly configured
☐ SQL injection prevention
☐ XSS protection enabled
☐ JWT secret is strong
☐ No sensitive data in logs
☐ Database backups configured
```

**Testing**
```
☐ All features tested
☐ Cross-browser tested
☐ Responsive design verified
☐ Load testing done
☐ Error scenarios tested
☐ Edge cases handled
```

### Monitoring Post-Deployment

```javascript
// Add error tracking
// Option 1: Sentry
import * as Sentry from "@sentry/react";

// Option 2: LogRocket
import LogRocket from 'logrocket';

// Setup monitoring
// - Error logging
// - Performance monitoring
// - User session tracking
// - Crash reporting
```

---

## 🔧 Useful Commands

### Backend Commands
```bash
# Start development
npm run dev

# Start production
npm start

# Run tests
npm test

# Install new package
npm install package-name

# Update package
npm update

# Uninstall package
npm uninstall package-name
```

### Frontend Commands
```bash
# Start development
npm start

# Build for production
npm build

# Run tests
npm test

# Eject configuration (not recommended)
npm run eject
```

### Database Commands
```bash
# Connect to database
psql -U postgres -d exam_seating_db

# Run SQL file
psql -U postgres -f schema.sql

# Backup database
pg_dump exam_seating_db > backup.sql

# Restore database
psql exam_seating_db < backup.sql

# List databases
\l

# List tables
\dt

# View table structure
\d table_name
```

---

## 📚 File Structure Explanation

### Backend Routes Structure
```javascript
// Each route file follows this pattern:
router.get('/', verifyToken, async (req, res) => {
  // Middleware: verifyToken
  // Handler: async function
  // Response: JSON
});

// Best practices:
// - Use consistent naming
// - Add validation
// - Handle errors
// - Return meaningful responses
```

### Frontend Component Structure
```javascript
// Components follow this pattern:
export const ComponentName = () => {
  // State: useState
  // Effects: useEffect
  // Handlers: onClick, onChange
  // JSX: Return UI
};

// Best practices:
// - Single responsibility
// - Props for data
// - Hooks for logic
// - Separation of concerns
```

---

## 🎨 CSS/Styling Tips

### Tailwind Classes Quick Reference
```html
<!-- Spacing -->
p-4 m-2 mb-6 pt-8

<!-- Colors -->
bg-blue-600 text-red-800 border-gray-200

<!-- Responsive -->
md:w-1/2 lg:flex sm:grid

<!-- State -->
hover:bg-blue-700 focus:outline-none

<!-- Display -->
flex grid inline-block hidden

<!-- Size -->
w-full h-screen max-w-7xl
```

### Creating Custom Styles
```css
/* Don't override Tailwind */
/* Use @apply for reusable patterns */

@apply px-4 py-2 rounded-lg font-medium;

/* Or use regular CSS when needed */
```

---

## 🚨 Error Handling Examples

### Frontend Error Handling
```javascript
try {
  const response = await examsAPI.getAll();
  setExams(response.data);
} catch (error) {
  const message = error.response?.data?.error || 'Failed to fetch';
  setError(message);
}
```

### Backend Error Handling
```javascript
try {
  // Database query
  const result = await pool.query(...);
  res.json(result.rows);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to fetch exams' });
}
```

---

## 🔐 Security Checklist

### Input Validation
```javascript
// Frontend
if (!email || !email.includes('@')) {
  return setError('Invalid email');
}

// Backend
body('email').isEmail().withMessage('Valid email required')
```

### Authentication
```javascript
// Check if user logged in
if (!token) {
  return res.status(401).json({ error: 'No token' });
}

// Verify token
const decoded = jwt.verify(token, JWT_SECRET);
```

### Authorization
```javascript
// Check user role
if (user.role !== 'admin') {
  return res.status(403).json({ error: 'Unauthorized' });
}
```

---

## 🎯 Performance Optimization Tips

### Frontend
1. Use React DevTools Profiler
2. Avoid unnecessary re-renders
3. Implement code splitting
4. Lazy load images
5. Use production build

### Backend
1. Use EXPLAIN ANALYZE
2. Add database indexes
3. Implement caching
4. Use connection pooling
5. Optimize queries

### Database
1. Vacuum regularly
2. Analyze regularly
3. Create indexes
4. Monitor slow queries
5. Archive old data

---

## 📖 Key Files to Remember

| File | Purpose |
|------|---------|
| `backend/server.js` | Backend entry point |
| `backend/config/database.js` | Database connection |
| `frontend/src/App.js` | Frontend router |
| `frontend/src/api/client.js` | API client |
| `frontend/src/context/AuthContext.js` | Auth state |
| `backend/db/schema.sql` | Database structure |

---

## 💬 Code Comments Guide

### Good Comments
```javascript
// Allocate seats ensuring no same course per bench
const allocatedSeats = allocateSeats(students, benchCount);

// Split students by course for better distribution
const courseGroups = groupStudentsByCourse(students);
```

### Avoid
```javascript
// i++  (obvious from code)
// set x to 5  (obvious from code)
// TODO: fix this  (should create issue instead)
```

---

## 🎓 Learning Path

### Week 1: Understand the System
- Read all documentation
- Understand database schema
- Review API endpoints
- Study seating algorithm

### Week 2: Backend Development
- Test all API endpoints
- Understand authentication flow
- Learn database queries
- Study error handling

### Week 3: Frontend Development
- Understand React structure
- Learn component patterns
- Study state management
- Test API integration

### Week 4: Testing & Deployment
- Manual testing
- Bug fixing
- Documentation review
- Production preparation

---

## 🆘 When Stuck

1. **Check error message** - Usually points to problem
2. **Google the error** - Others likely faced it
3. **Check documentation** - Answers are there
4. **Debug systematically** - Add console logs
5. **Review similar code** - Pattern already exists
6. **Ask teammate** - Fresh perspective helps

---

**Happy Coding! 🚀**

Remember: Clean code is readable code. Comment when necessary. Test thoroughly. Deploy with confidence!
