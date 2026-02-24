# Candidate Profile Management Guide

## Overview
Complete candidate profile management system with CRUD operations for work experience, education, skills, and profile completeness tracking.

## Step 1.3 Completed Features

### 1. Profile Hook (`useProfile.ts`)
✅ Centralized state management for all profile data
✅ Automatic data fetching on mount
✅ Profile completeness calculation
✅ Refetch functionality for updates

### 2. Profile Completeness Indicator
✅ Real-time completeness percentage (0-100%)
✅ Visual progress bar
✅ Task checklist with completion status
✅ Color-coded feedback (red < 50%, yellow < 80%, green ≥ 80%)
✅ Motivational messages based on progress

### 3. Basic Information Form
✅ Full profile editing with all fields:
- Personal info (name, phone, location, bio)
- Professional details (title, experience, salary expectations)
- Social links (LinkedIn, Portfolio, GitHub)
- Privacy settings (profile visibility)
- Job alerts toggle
✅ Form validation
✅ Create/Update operations
✅ Character counter for bio
✅ Loading states

### 4. Work Experience CRUD
✅ Add/Edit/Delete work experience
✅ Fields:
- Company name, job title
- Employment type (full-time, part-time, contract, freelance, internship)
- Location
- Start/End dates with "current position" toggle
- Description
✅ Modal dialog for forms
✅ Chronological display (newest first)
✅ Date formatting
✅ Empty state handling

### 5. Education CRUD
✅ Add/Edit/Delete education entries
✅ Fields:
- Institution name
- Degree type (Bachelor's, Master's, PhD, etc.)
- Field of study
- Location
- Start/End dates with "currently studying" toggle
- Grade/GPA
- Description
✅ Modal dialog for forms
✅ Chronological display
✅ Empty state handling

### 6. Skills Management
✅ Add/Edit/Delete skills
✅ Fields:
- Skill name
- Category (technical, soft, language, tool, other)
- Proficiency level (beginner, intermediate, advanced, expert)
- Years of experience
✅ Grouped display by category
✅ Badge-based UI with proficiency indicators
✅ Hover actions for edit/delete
✅ Empty state handling

## File Structure

```
careerninja/
├── src/
│   ├── hooks/
│   │   └── useProfile.ts (Profile state management)
│   └── components/
│       └── profile/
│           ├── ProfileCompletenessCard.tsx
│           ├── BasicInfoForm.tsx
│           ├── WorkExperienceSection.tsx
│           ├── EducationSection.tsx
│           └── SkillsSection.tsx
└── app/
    └── dashboard/
        └── profile/
            └── page.tsx (Main profile page)
```

## Profile Completeness Calculation

The completeness score is calculated based on weighted criteria:

### Basic Info (30%)
- Full name: 5%
- Phone: 5%
- Location: 5%
- Bio (>50 chars): 10%
- Social links: 5%

### Professional (20%)
- Current title: 10%
- Years of experience: 5%
- Expected salary: 5%

### Work Experience (20%)
- At least 1 entry: 10%
- At least 2 entries: 5%
- Detailed description: 5%

### Education (15%)
- At least 1 entry: 10%
- At least 2 entries: 5%

### Skills (15%)
- At least 3 skills: 5%
- At least 5 skills: 5%
- At least 10 skills: 5%

**Total: 100%**

## Usage

### Accessing the Profile Page

Navigate to `/dashboard/profile` to manage your profile.

### Adding Work Experience

1. Click "Add Experience" button
2. Fill in the form fields
3. Toggle "I currently work here" if applicable
4. Click "Save"

### Adding Education

1. Click "Add Education" button
2. Fill in institution, degree, and field of study
3. Add dates and grade if available
4. Click "Save"

### Adding Skills

1. Click "Add Skill" button
2. Enter skill name
3. Select category and proficiency level
4. Optionally add years of experience
5. Click "Save"

### Editing Entries

- Click the edit icon on any entry
- Modify the fields
- Click "Save"

### Deleting Entries

- Click the delete icon on any entry
- Confirm deletion in the dialog

## API Examples

### Fetch Profile
```typescript
const { data, error } = await supabase
  .from('candidate_profiles')
  .select('*')
  .eq('user_id', userId)
  .single();
```

### Create/Update Profile
```typescript
// Create
const { error } = await supabase
  .from('candidate_profiles')
  .insert({ user_id, full_name, ... });

// Update
const { error } = await supabase
  .from('candidate_profiles')
  .update({ full_name, ... })
  .eq('id', profileId);
```

### Add Work Experience
```typescript
const { error } = await supabase
  .from('candidate_work_experience')
  .insert({
    candidate_id,
    company_name,
    job_title,
    start_date,
    ...
  });
```

### Add Education
```typescript
const { error } = await supabase
  .from('candidate_education')
  .insert({
    candidate_id,
    institution_name,
    degree_type,
    field_of_study,
    ...
  });
```

### Add Skill
```typescript
const { error } = await supabase
  .from('candidate_skills')
  .insert({
    candidate_id,
    skill_name,
    proficiency_level,
    ...
  });
```

## Profile Visibility Options

- **Private**: Only you can see your profile
- **Recruiters Only**: Only verified recruiters can view
- **Public**: Anyone can view your profile

## Best Practices

### For Candidates

1. **Complete Your Profile**: Aim for at least 80% completeness
2. **Be Specific**: Add detailed descriptions for work experience
3. **Keep It Updated**: Regularly update your skills and experience
4. **Add Multiple Entries**: Include all relevant work and education
5. **Use Keywords**: Include industry-relevant skills
6. **Professional Links**: Add LinkedIn, portfolio, and GitHub

### For Developers

1. **Validation**: Always validate user input
2. **Error Handling**: Provide clear error messages
3. **Loading States**: Show loading indicators during operations
4. **Optimistic Updates**: Consider optimistic UI updates
5. **Data Consistency**: Ensure foreign key relationships are maintained

## Testing Checklist

- [ ] Create new profile
- [ ] Update existing profile
- [ ] Add work experience
- [ ] Edit work experience
- [ ] Delete work experience
- [ ] Add education
- [ ] Edit education
- [ ] Delete education
- [ ] Add skills
- [ ] Edit skills
- [ ] Delete skills
- [ ] Profile completeness updates correctly
- [ ] Form validation works
- [ ] Empty states display correctly
- [ ] Date formatting is correct
- [ ] Modal dialogs open/close properly
- [ ] RLS policies prevent unauthorized access

## Troubleshooting

### Issue: Profile not loading
- Check user authentication
- Verify RLS policies
- Check browser console for errors

### Issue: Cannot save profile
- Verify all required fields are filled
- Check for validation errors
- Ensure user has permission

### Issue: Completeness not updating
- Check if all data is fetched correctly
- Verify calculation logic
- Ensure refetch is called after updates

### Issue: Skills not grouping correctly
- Verify skill_category values
- Check grouping logic in component
- Ensure data is fetched properly

## Next Steps (Step 1.4)

1. Add document upload for certificates
2. Implement profile preview for employers
3. Add profile export (PDF/JSON)
4. Create profile sharing functionality
5. Add profile analytics (views, applications)
6. Implement skill endorsements
7. Add profile recommendations

## Security Considerations

1. All profile data protected by RLS policies
2. Users can only edit their own profiles
3. Profile visibility settings respected
4. Input sanitization on all fields
5. File upload validation (for future document uploads)

## Performance Optimizations

1. Single hook for all profile data
2. Efficient data fetching with proper joins
3. Optimistic UI updates where possible
4. Lazy loading for large datasets
5. Proper indexing on database tables
