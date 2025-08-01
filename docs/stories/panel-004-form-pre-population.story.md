# User Story: Automatic Form Pre-Population

**Story ID**: PANEL-004  
**Epic**: Panel Defense Critical Requirements  
**Priority**: HIGH  
**Story Points**: 7  
**Sprint**: Panel Compliance Sprint 2  

## User Story

**As a** logged-in student recording attendance  
**I want** my name, course, and year automatically filled in the attendance form  
**So that** I only need to provide my photo and signature, making the process faster and less prone to errors

## Background Context

The academic panel emphasized that once a student is authenticated, the system should automatically populate all available user information in the attendance form. Students should only need to manually provide their photo and signature, as these are the unique verification elements that cannot be pre-filled.

## Acceptance Criteria

### Scenario 1: Automatic Form Population on Load
**Given** I am logged in to the system  
**When** I access an attendance form  
**Then** my full name should be automatically populated  
**And** my course should be automatically filled  
**And** my year level should be pre-selected  
**And** my student ID should be populated  
**And** only photo capture and signature fields should require manual input

### Scenario 2: Visual Indication of Pre-filled Fields
**Given** the attendance form is loaded with my data  
**When** I view the form  
**Then** pre-filled fields should have a subtle visual indicator  
**And** I should see which fields are editable vs. pre-filled  
**And** pre-filled fields should be clearly readable  
**And** the form should focus automatically on the first manual entry field (photo or signature)

### Scenario 3: Edit Pre-filled Information
**Given** my information is pre-populated in the form  
**When** I notice incorrect or outdated information  
**Then** I should be able to edit the pre-filled data  
**And** editing should be easy with clear edit buttons or clickable fields  
**And** changes should be validated before submission  
**And** I should be able to save corrections to my profile for future use

### Scenario 4: Missing Profile Information Handling
**Given** I am logged in but my profile is incomplete  
**When** the form attempts to pre-populate  
**Then** available fields should be filled automatically  
**And** missing fields should prompt for manual entry  
**And** I should see clear indicators of which fields need completion  
**And** the system should remind me to update my profile

### Scenario 5: Multiple Campus Context
**Given** I am a student enrolled at multiple campus locations  
**When** I access an attendance form for a specific campus event  
**Then** my campus-specific information should be used  
**And** the correct course codes and year levels for that campus should be shown  
**And** my campus-specific student ID should be used if different

### Scenario 6: Form Submission with Pre-filled Data
**Given** I have completed the form with pre-populated data  
**When** I submit the attendance record  
**Then** all pre-filled data should be included in the submission  
**And** any edits I made should override the original pre-filled values  
**And** the system should validate all data before accepting submission  
**And** my profile should be updated with any corrections I made

## Definition of Done

### Functional Requirements
- [ ] User profile data automatically populates form fields
- [ ] Only photo and signature require manual input
- [ ] Pre-filled fields are clearly indicated and editable
- [ ] Missing profile data handled gracefully
- [ ] Campus-specific information used correctly

### Technical Requirements
- [ ] Integration with user profile/authentication system
- [ ] Form validation for both pre-filled and manual data
- [ ] Profile update mechanism for corrected information
- [ ] Error handling for data retrieval failures
- [ ] Unit tests for all auto-population scenarios

### UX Requirements
- [ ] Clear visual distinction between auto-filled and manual fields
- [ ] Intuitive editing interface for pre-filled data
- [ ] Automatic focus on first manual entry field
- [ ] Mobile-responsive form layout with pre-population
- [ ] Loading states while retrieving user data

## Technical Specifications

### User Data Retrieval Hook
```javascript
const useAttendanceFormData = (eventId) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadUserFormData = async () => {
      try {
        setLoading(true);
        
        // Get user profile data
        const profileResponse = await api.user.getProfile(user.id);
        const profile = profileResponse.data;
        
        // Get event-specific context if needed
        let eventContext = {};
        if (eventId) {
          const eventResponse = await api.events.getById(eventId);
          eventContext = {
            campus: eventResponse.data.campus,
            department: eventResponse.data.department
          };
        }
        
        // Prepare form data with user information
        const preparedData = {
          // Auto-filled fields
          studentId: profile.studentId || user.studentId,
          fullName: profile.fullName || `${user.firstName} ${user.lastName}`,
          course: getCampusSpecificCourse(profile.courses, eventContext.campus),
          yearLevel: profile.yearLevel || '',
          email: profile.email || user.email,
          phone: profile.phone || '',
          section: profile.section || '',
          
          // Manual entry fields (initially empty)
          photo: null,
          signature: null,
          
          // Metadata
          isProfileComplete: checkProfileCompleteness(profile),
          editableFields: getEditableFields(profile),
          campusContext: eventContext
        };
        
        setFormData(preparedData);
      } catch (err) {
        setError('Failed to load user information');
        console.error('Error loading user form data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadUserFormData();
    }
  }, [user, eventId]);
  
  const updateFormField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  const saveProfileUpdates = useCallback(async (updatedFields) => {
    try {
      await api.user.updateProfile(user.id, updatedFields);
      // Update local form data to reflect saved changes
      setFormData(prev => ({
        ...prev,
        ...updatedFields
      }));
    } catch (error) {
      throw new Error('Failed to save profile updates');
    }
  }, [user.id]);
  
  return {
    formData,
    loading,
    error,
    updateFormField,
    saveProfileUpdates
  };
};
```

### Pre-filled Form Component
```jsx
const PreFilledAttendanceForm = ({ eventId, onSubmit }) => {
  const { formData, loading, error, updateFormField, saveProfileUpdates } = useAttendanceFormData(eventId);
  const [editingField, setEditingField] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});
  
  if (loading) return <FormLoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} />;
  if (!formData) return <ErrorDisplay message="Unable to load user data" />;
  
  const handleFieldEdit = (field, value) => {
    updateFormField(field, value);
    setPendingChanges(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const saveProfileEdit = async (field) => {
    try {
      await saveProfileUpdates({ [field]: formData[field] });
      setPendingChanges(prev => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });
      setEditingField(null);
      showNotification('Profile updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to save changes', 'error');
    }
  };
  
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Auto-filled Student Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-3 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Student Information (Auto-filled)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PrefilledField
            label="Full Name"
            value={formData.fullName}
            field="fullName"
            editing={editingField === 'fullName'}
            onEdit={(value) => handleFieldEdit('fullName', value)}
            onSave={() => saveProfileEdit('fullName')}
            onStartEdit={() => setEditingField('fullName')}
            onCancelEdit={() => setEditingField(null)}
            required
          />
          
          <PrefilledField
            label="Student ID"
            value={formData.studentId}
            field="studentId"
            editing={editingField === 'studentId'}
            onEdit={(value) => handleFieldEdit('studentId', value)}
            onSave={() => saveProfileEdit('studentId')}
            onStartEdit={() => setEditingField('studentId')}
            onCancelEdit={() => setEditingField(null)}
            required
          />
          
          <PrefilledField
            label="Course"
            value={formData.course}
            field="course"
            editing={editingField === 'course'}
            onEdit={(value) => handleFieldEdit('course', value)}
            onSave={() => saveProfileEdit('course')}
            onStartEdit={() => setEditingField('course')}
            onCancelEdit={() => setEditingField(null)}
            required
          />
          
          <PrefilledField
            label="Year Level"
            value={formData.yearLevel}
            field="yearLevel"
            editing={editingField === 'yearLevel'}
            onEdit={(value) => handleFieldEdit('yearLevel', value)}
            onSave={() => saveProfileEdit('yearLevel')}
            onStartEdit={() => setEditingField('yearLevel')}
            onCancelEdit={() => setEditingField(null)}
            type="select"
            options={['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate']}
            required
          />
        </div>
        
        {Object.keys(pendingChanges).length > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              You have unsaved changes to your profile. These will be saved when you update the fields.
            </p>
          </div>
        )}
      </div>
      
      {/* Manual Entry Fields */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Camera className="h-5 w-5 mr-2" />
          Verification Required (Manual Entry)
        </h3>
        
        <div className="space-y-6">
          <PhotoCaptureField
            label="Attendance Photo"
            value={formData.photo}
            onChange={(photo) => updateFormField('photo', photo)}
            required
            autoFocus
          />
          
          <SignatureField
            label="Digital Signature"
            value={formData.signature}
            onChange={(signature) => updateFormField('signature', signature)}
            required
          />
        </div>
      </div>
      
      {/* Profile Completeness Warning */}
      {!formData.isProfileComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Profile Incomplete</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Some information is missing from your profile. Consider updating your profile after submitting attendance.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Button type="submit" className="w-full" size="lg">
        Submit Attendance
      </Button>
    </form>
  );
};
```

### Prefilled Field Component
```jsx
const PrefilledField = ({
  label,
  value,
  field,
  editing,
  onEdit,
  onSave,
  onStartEdit,
  onCancelEdit,
  type = 'text',
  options = [],
  required = false
}) => {
  const [editValue, setEditValue] = useState(value);
  
  useEffect(() => {
    setEditValue(value);
  }, [value]);
  
  const handleSave = () => {
    onEdit(editValue);
    onSave();
  };
  
  const handleCancel = () => {
    setEditValue(value);
    onCancelEdit();
  };
  
  if (editing) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex space-x-2">
          {type === 'select' ? (
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select {label}</option>
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          )}
          <Button size="sm" onClick={handleSave} disabled={!editValue.trim()}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center space-x-2">
        <div className="flex-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-blue-900">
          {value || (
            <span className="text-gray-500 italic">Not provided</span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onStartEdit}
          className="text-blue-600 border-blue-300 hover:bg-blue-50"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
```

### Campus-Specific Data Handling
```javascript
const getCampusSpecificCourse = (userCourses, eventCampus) => {
  if (!userCourses || !eventCampus) {
    return userCourses?.[0]?.name || '';
  }
  
  // Find course specific to the event's campus
  const campusSpecificCourse = userCourses.find(
    course => course.campus === eventCampus
  );
  
  return campusSpecificCourse?.name || userCourses[0]?.name || '';
};

const checkProfileCompleteness = (profile) => {
  const requiredFields = ['fullName', 'studentId', 'course', 'yearLevel', 'email'];
  return requiredFields.every(field => profile[field] && profile[field].trim() !== '');
};

const getEditableFields = (profile) => {
  // Fields that can be edited by the user
  return {
    fullName: true,
    course: true,
    yearLevel: true,
    section: true,
    phone: true,
    studentId: false, // Usually not editable after account creation
    email: false // Usually requires verification process
  };
};
```

## Design Specifications

### Visual Design for Pre-filled Fields

**Auto-filled Field Styling**:
- Background: Light blue (#F0F8FF)
- Border: Blue (#3B82F6)
- Text: Dark blue (#1E40AF)
- Icon: Edit pencil icon in blue
- Hover state: Slightly darker background

**Manual Entry Field Styling**:
- Background: White (#FFFFFF)
- Border: Gray (#D1D5DB) 
- Text: Black (#000000)
- Focus state: Blue ring and border
- Required indicator: Red asterisk

**Field States**:
1. **Auto-filled**: Blue background, read-only appearance with edit button
2. **Editing**: White background, blue border, save/cancel buttons
3. **Manual**: Standard form field appearance
4. **Required**: Red asterisk indicator
5. **Error**: Red border and error message

### Layout and Spacing

**Form Sections**:
- Auto-filled information: Grouped in blue-tinted container
- Manual entry fields: Grouped in white container
- Profile warnings: Yellow-tinted alert container
- Submit button: Full-width, prominent placement

**Responsive Design**:
- **Mobile (<640px)**: Single column layout, larger touch targets
- **Tablet (640-1024px)**: Two-column grid for auto-filled fields
- **Desktop (>1024px)**: Optimized spacing and hover interactions

## Testing Strategy

### Unit Tests
```javascript
describe('useAttendanceFormData', () => {
  test('loads user profile data correctly', async () => {
    const mockUser = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      studentId: '2021-0001'
    };
    
    const mockProfile = {
      fullName: 'John Doe',
      course: 'Computer Science',
      yearLevel: '3rd Year',
      email: 'john.doe@university.edu'
    };
    
    api.user.getProfile.mockResolvedValue({ data: mockProfile });
    
    const { result, waitForNextUpdate } = renderHook(() =>
      useAttendanceFormData(123),
      {
        wrapper: ({ children }) => (
          <AuthProvider value={{ user: mockUser }}>
            {children}
          </AuthProvider>
        )
      }
    );
    
    await waitForNextUpdate();
    
    expect(result.current.formData.fullName).toBe('John Doe');
    expect(result.current.formData.course).toBe('Computer Science');
    expect(result.current.formData.photo).toBeNull();
    expect(result.current.formData.signature).toBeNull();
  });
});

describe('PrefilledField', () => {
  test('displays read-only value with edit button', () => {
    render(
      <PrefilledField
        label="Full Name"
        value="John Doe"
        field="fullName"
        editing={false}
        onStartEdit={jest.fn()}
      />
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  
  test('switches to edit mode when edit button clicked', () => {
    const onStartEdit = jest.fn();
    render(
      <PrefilledField
        label="Full Name"
        value="John Doe"
        field="fullName"
        editing={false}
        onStartEdit={onStartEdit}
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(onStartEdit).toHaveBeenCalled();
  });
});
```

### Integration Tests
```javascript
describe('Form Pre-population Integration', () => {
  test('complete form loads with user data and allows manual entry', async () => {
    const mockUser = { id: 1, firstName: 'Jane', lastName: 'Smith' };
    const mockProfile = {
      fullName: 'Jane Smith',
      course: 'Information Technology',
      yearLevel: '2nd Year'
    };
    
    api.user.getProfile.mockResolvedValue({ data: mockProfile });
    
    render(
      <AuthProvider value={{ user: mockUser }}>
        <PreFilledAttendanceForm eventId={123} onSubmit={jest.fn()} />
      </AuthProvider>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Information Technology')).toBeInTheDocument();
    });
    
    // Manual entry fields should be empty and focusable
    expect(screen.getByText('Attendance Photo')).toBeInTheDocument();
    expect(screen.getByText('Digital Signature')).toBeInTheDocument();
  });
});
```

### User Acceptance Tests

1. **Test Case**: Student with complete profile accesses attendance form
   - **Steps**: Login with complete profile, access attendance form
   - **Expected**: All fields pre-filled except photo and signature

2. **Test Case**: Student needs to correct pre-filled information
   - **Steps**: See incorrect course, click edit, change value, save
   - **Expected**: Field updates immediately, profile saved for future

3. **Test Case**: Student with incomplete profile uses form
   - **Steps**: Login with partial profile, access form
   - **Expected**: Available fields pre-filled, missing fields indicated

## Error Handling

### Profile Data Loading Errors
```javascript
const handleProfileError = (error) => {
  switch (error.type) {
    case 'PROFILE_NOT_FOUND':
      return {
        message: 'Profile not found. Please complete your profile setup.',
        action: 'redirect_to_profile'
      };
      
    case 'INCOMPLETE_PROFILE':
      return {
        message: 'Some profile information is missing. You can still proceed with attendance.',
        action: 'show_warning'
      };
      
    case 'NETWORK_ERROR':
      return {
        message: 'Unable to load profile data. Please check your connection.',
        action: 'retry'
      };
      
    default:
      return {
        message: 'Unable to load profile information. You can enter data manually.',
        action: 'manual_entry'
      };
  }
};
```

### Data Validation
```javascript
const validateFormData = (formData) => {
  const errors = {};
  
  // Validate required pre-filled fields
  if (!formData.fullName?.trim()) {
    errors.fullName = 'Full name is required';
  }
  
  if (!formData.studentId?.trim()) {
    errors.studentId = 'Student ID is required';
  }
  
  if (!formData.course?.trim()) {
    errors.course = 'Course is required';
  }
  
  // Validate manual entry fields
  if (!formData.photo) {
    errors.photo = 'Attendance photo is required';
  }
  
  if (!formData.signature) {
    errors.signature = 'Digital signature is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

## Success Metrics

### User Experience Metrics
- >95% of forms load with complete user data pre-filled
- <10 seconds average time from form load to first manual entry
- >90% user satisfaction with pre-filling accuracy
- <5% of users need to edit pre-filled information

### Technical Performance Metrics
- Profile data loads within 2 seconds
- Form renders completely within 3 seconds
- Profile updates save within 1 second
- Zero data loss during editing process

### Academic Compliance Metrics
- Panel requirement for "automatic form pre-population" fully satisfied
- Only photo and signature require manual entry as specified
- Professional user experience matching university standards
- Proper data validation and error handling throughout

---

**Story Prepared By**: BMad Orchestrator  
**Data Privacy Review**: Required for profile data handling  
**Performance Review**: Required for data loading optimization  
**Panel Compliance**: HIGH priority for reducing manual data entry
