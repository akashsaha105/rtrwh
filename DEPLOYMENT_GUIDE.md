# Deployment Guide - RTRWH Feasibility Engine

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project created
3. Node.js 18+ installed

## Step 1: Initialize Firebase (if not done)

```bash
firebase login
firebase init
```

Select:
- ✅ Firestore
- ✅ Functions
- ✅ Use existing project (or create new)

## Step 2: Install Function Dependencies

```bash
cd functions
npm install
```

## Step 3: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

This deploys the security rules from `firestore.rules` to allow:
- Users to read/write their own assessments
- Cloud Functions to write reports and cache
- Authenticated users to read reports

## Step 4: Deploy Cloud Function

```bash
firebase deploy --only functions:onAssessmentCreate
```

Or deploy all functions:
```bash
firebase deploy --only functions
```

## Step 5: Verify Deployment

1. Go to Firebase Console → Functions
2. Verify `onAssessmentCreate` is deployed
3. Check logs for any errors

## Step 6: Test the System

### Create a Test Assessment

In Firestore Console or via code:

```javascript
// Using Firebase Admin SDK or Firestore Console
await firestore.collection('assessments').add({
  name: "Test Assessment",
  location: { lat: 28.6139, lng: 77.2090 }, // Delhi
  dwellers: 4,
  roofArea_m2: 100,
  openSpace_m2: 30,
  roofMaterial: "Concrete",
  roofSlope: "Flat",
  userId: "your-user-id",
  status: "processing",
  createdAt: FieldValue.serverTimestamp()
});
```

### Expected Results

1. **Cloud Function triggers** (check Functions logs)
2. **Report created** in `reports/{assessmentId}`
3. **Cache entry** in `gisCache/{geohash}`
4. **Assessment updated** with status: "done"

## Monitoring

### View Logs
```bash
firebase functions:log
```

### Check Firestore
- Go to Firebase Console → Firestore Database
- Verify collections:
  - `assessments` - Input documents
  - `reports` - Generated reports
  - `gisCache` - Cached GIS data

## Troubleshooting

### Function Not Triggering
- Check Firestore rules allow writes
- Verify function is deployed
- Check function logs for errors

### Data Not Saving
- Check Firestore security rules
- Verify Cloud Function has admin privileges
- Check function logs for write errors

### API Errors
- Check network connectivity
- Verify API endpoints are accessible
- Check timeout settings

## Local Development

```bash
# Start emulators
firebase emulators:start --only functions,firestore

# In another terminal, trigger function
# Create assessment document in emulator
```

## Production Checklist

- [ ] Firestore rules deployed
- [ ] Cloud Function deployed
- [ ] Function has proper permissions
- [ ] Test assessment created and processed
- [ ] Report appears in Firestore
- [ ] Frontend displays report correctly
- [ ] Error handling works
- [ ] Logging is enabled


