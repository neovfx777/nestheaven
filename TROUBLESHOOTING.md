# Troubleshooting Complex Creation Error

## Error: `ERR_CONNECTION_RESET` or `Network Error`

### Possible Causes:

1. **Backend Server Not Running**
   - Check if backend is running: `cd backend && npm start`
   - Check if port 3000 is available
   - Check backend logs for errors

2. **Content-Type Header Issue** ✅ FIXED
   - **Problem**: Frontend was manually setting `Content-Type: multipart/form-data`
   - **Solution**: Removed manual header - axios automatically sets correct Content-Type with boundary
   - **File**: `frontend/src/pages/dashboard/admin/ComplexFormNew.tsx`

3. **Multer Error Not Caught**
   - Added `handleMulterError` middleware to catch multer errors
   - **File**: `backend/src/modules/complexes/complexes.routes.js`

4. **Validator Crashes**
   - Improved error handling in validator
   - Added try-catch with proper error responses
   - **File**: `backend/src/modules/complexes/complexes.validators.js`

5. **Database/Prisma Errors**
   - Added better error logging in service
   - **File**: `backend/src/modules/complexes/complexes.service.js`

### Steps to Debug:

1. **Check Backend Logs**
   ```bash
   cd backend
   npm start
   # Watch for errors in console
   ```

2. **Test Endpoint Manually**
   ```bash
   cd backend
   node scripts/test-complex-endpoint.js
   ```

3. **Check Network Tab**
   - Open browser DevTools → Network tab
   - Submit form and check the request
   - Look for:
     - Request headers (should NOT have manual Content-Type)
     - Response status
     - Response body

4. **Check Backend Console**
   - Look for:
     - `=== Validator: validateCreate ===`
     - `=== Complex Create Request ===`
     - `=== Prisma Create Data ===`
   - Any error messages

### Common Issues:

#### Issue 1: Missing Permission Files
- **Error**: "Provide all three permission files"
- **Solution**: Make sure all 3 permission files are uploaded for new complexes

#### Issue 2: Invalid File Type
- **Error**: "Invalid file type"
- **Solution**: 
  - Banner: JPEG, PNG, WebP
  - Permissions: PDF, JPEG, PNG

#### Issue 3: File Too Large
- **Error**: "File too large"
- **Solution**: Check `MAX_FILE_SIZE_MB` in `.env` (default: 10MB)

#### Issue 4: Validation Errors
- **Error**: "Validation failed"
- **Solution**: Check console logs for specific validation errors
- Common issues:
  - Missing title in all languages
  - Invalid location data
  - Missing required fields

### Testing:

1. **Test with minimal data**:
   ```javascript
   // Only required fields
   - title (all languages)
   - city
   - developer
   - location (lat, lng, address)
   - permission files (for new complex)
   ```

2. **Check browser console**:
   - Look for any JavaScript errors
   - Check network request details

3. **Check backend logs**:
   - All console.log statements should appear
   - Look for error messages

### Fixed Issues:

✅ Removed manual `Content-Type` header from FormData request
✅ Added multer error handling middleware
✅ Improved validator error handling
✅ Added better Prisma error logging
✅ Added test script for endpoint testing

### Next Steps if Still Failing:

1. Check if backend server is actually running
2. Check backend console for specific error messages
3. Verify database connection
4. Check file permissions for upload directory
5. Verify CORS settings allow requests from frontend
