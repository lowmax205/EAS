# 💻 EAS Development Standards & Guidelines

This document establishes coding standards, development patterns, and contribution guidelines for AI agents and developers working on the EAS multi-campus enhancement project.

## 🎯 Code Architecture Patterns

### **Frontend Patterns (React + Vite + ShadCN/UI)**

#### **Component Structure Pattern**
```typescript
// Feature-based organization following existing patterns
src/features/{domain}/
├── components/           # Domain-specific components
├── hooks/               # Custom hooks for domain logic
├── services/            # API clients and data logic
├── types/               # TypeScript interfaces
└── index.ts            # Export barrel file

// Example: Campus feature structure
src/features/campus/
├── components/
│   ├── CampusSelector.tsx
│   ├── CampusCard.tsx
│   └── CampusManagementTable.tsx
├── hooks/
│   ├── useCampusContext.ts
│   └── useCampusFiltering.ts
├── services/
│   └── campusService.ts
├── types/
│   └── campus.types.ts
└── index.ts
```

#### **ShadCN/UI Component Usage**
**Standard Pattern:** Extend ShadCN/UI components with EAS-specific functionality
```typescript
// ✅ Correct: Extend existing ShadCN component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const CampusSelector = ({ onCampusChange, currentCampus }) => {
  return (
    <Card className="campus-selector">
      <CardHeader>
        <CardTitle>Select Campus</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={currentCampus} onValueChange={onCampusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose campus..." />
          </SelectTrigger>
          <SelectContent>
            {campuses.map(campus => (
              <SelectItem key={campus.id} value={campus.id}>
                {campus.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
```

#### **Service Layer Pattern**
**Campus-Aware API Services:** All services must support campus context injection
```typescript
// ✅ Standard service pattern with campus context
class EventService {
  async getEvents(campusId?: number): Promise<Event[]> {
    // Campus filtering applied at service level
    const params = campusId ? { campus_id: campusId } : {}
    return this.apiClient.get('/events', { params })
  }

  async createEvent(event: CreateEventRequest, campusId: number): Promise<Event> {
    // Campus context injected for creation
    return this.apiClient.post('/events', { ...event, campus_id: campusId })
  }
}
```

#### **State Management Pattern**
**Campus Context Provider:** Use React Context for campus state management
```typescript
// Campus context pattern for multi-campus awareness
const CampusContext = createContext<{
  currentCampus: Campus | null
  availableCampuses: Campus[]
  switchCampus: (campusId: number) => void
  isSuperAdmin: boolean
}>()

export const CampusProvider = ({ children }) => {
  const [currentCampus, setCurrentCampus] = useState<Campus | null>(null)
  const { user } = useAuth()
  
  // Campus context logic...
  
  return (
    <CampusContext.Provider value={{ currentCampus, availableCampuses, switchCampus, isSuperAdmin }}>
      {children}
    </CampusContext.Provider>
  )
}
```

### **Backend Patterns (Django + DRF)**

#### **Model Enhancement Pattern**
**Campus-Aware Models:** Extend existing models with campus relationships
```python
# ✅ Backward-compatible model enhancement
class Event(models.Model):
    # Existing fields remain unchanged
    title = models.CharField(max_length=200)
    description = models.TextField()
    organizer = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # NEW: Campus relationship (nullable for backward compatibility)
    campus = models.ForeignKey(
        'Campus', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        help_text="Campus this event belongs to"
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['campus', 'date']),  # Campus-based query optimization
        ]
```

#### **Service Layer Pattern**
**Campus Context Injection:** Services automatically apply campus filtering
```python
# ✅ Campus-aware service pattern
class EventService:
    def get_events_for_user(self, user: User, campus_id: Optional[int] = None) -> QuerySet:
        """Get events with campus context applied"""
        queryset = Event.objects.all()
        
        # Apply campus filtering based on user permissions
        if user.is_superuser and campus_id:
            queryset = queryset.filter(campus_id=campus_id)
        elif user.campus_id:
            queryset = queryset.filter(campus_id=user.campus_id)
        
        return queryset
```

#### **API Endpoint Pattern**
**Campus Parameter Support:** APIs support optional campus context
```python
# ✅ Campus-aware API pattern
class EventViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = Event.objects.all()
        campus_id = self.request.query_params.get('campus_id')
        
        # Apply campus filtering with user authorization
        if campus_id and self.request.user.can_access_campus(campus_id):
            queryset = queryset.filter(campus_id=campus_id)
        elif self.request.user.campus_id:
            queryset = queryset.filter(campus_id=self.request.user.campus_id)
            
        return queryset
```

## 📋 Coding Standards

### **TypeScript Standards**
```typescript
// ✅ Interface naming: PascalCase with descriptive names
interface CampusUser {
  id: number
  campusId: number
  campusName: string  // Computed field
  role: UserRole
}

// ✅ Type unions for controlled values
type UserRole = 'student' | 'organizer' | 'campus_admin' | 'super_admin'

// ✅ Optional properties for backward compatibility
interface Event {
  id: number
  title: string
  campusId?: number  // Optional for existing events
}
```

### **React Component Standards**
```typescript
// ✅ Component naming: PascalCase, descriptive
export const CampusEventCard: React.FC<CampusEventCardProps> = ({
  event,
  onEdit,
  onDelete,
  campusContext
}) => {
  // Component logic...
}

// ✅ Props interface naming: ComponentName + Props
interface CampusEventCardProps {
  event: Event
  onEdit: (event: Event) => void
  onDelete: (eventId: number) => void
  campusContext?: CampusContext
}
```

### **CSS/Styling Standards**
```css
/* ✅ CSS naming: BEM methodology with campus prefixes */
.campus-selector {
  @apply w-full max-w-md;
}

.campus-selector__dropdown {
  @apply min-w-0 flex-1;
}

.campus-selector__option--selected {
  @apply bg-primary text-primary-foreground;
}

/* ✅ Use Tailwind utilities, custom CSS only when necessary */
.campus-aware-table {
  @apply w-full border-collapse border border-border;
}
```

## 🧪 Testing Standards

### **Unit Testing Patterns**
```typescript
// ✅ Test campus context injection
describe('EventService', () => {
  it('filters events by campus for regular users', async () => {
    const mockUser = { campusId: 1, role: 'student' }
    const events = await eventService.getEvents(mockUser)
    
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ campusId: 1 })
      ])
    )
  })
  
  it('allows super admin to access all campuses', async () => {
    const superAdmin = { role: 'super_admin' }
    const events = await eventService.getEvents(superAdmin, 2)
    
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ campusId: 2 })
      ])
    )
  })
})
```

### **Integration Testing Patterns**
```typescript
// ✅ Test campus data isolation
describe('Campus Data Isolation', () => {
  it('prevents cross-campus data leakage', async () => {
    const campus1User = await createTestUser({ campusId: 1 })
    const campus2Event = await createTestEvent({ campusId: 2 })
    
    const response = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${campus1User.token}`)
    
    expect(response.body).not.toContainEqual(
      expect.objectContaining({ id: campus2Event.id })
    )
  })
})
```

## 📝 Documentation Standards

### **Code Documentation**
```typescript
/**
 * Campus-aware event filtering hook that applies proper data isolation
 * based on user permissions and campus context.
 * 
 * @param user - Current user with campus assignment
 * @param selectedCampusId - Optional campus override for super admins
 * @returns Filtered events with campus context applied
 */
export const useCampusFilteredEvents = (
  user: User, 
  selectedCampusId?: number
): {
  events: Event[]
  isLoading: boolean
  error: Error | null
} => {
  // Hook implementation...
}
```

### **Commit Message Standards**
```bash
# ✅ Commit format: type(scope): description
feat(campus): add campus selector component with shadcn/ui integration
fix(auth): resolve campus context not persisting across sessions
docs(architecture): update data model documentation for campus relationships
test(campus): add integration tests for campus data isolation
refactor(events): extract campus filtering logic to reusable hook
```

## 🔄 Development Workflow

### **Feature Development Process**
1. **Story Analysis:** Review user story and acceptance criteria
2. **Architecture Review:** Ensure alignment with existing patterns
3. **Implementation:** Follow established patterns and standards
4. **Testing:** Unit tests + integration tests for campus isolation
5. **Documentation:** Update relevant docs and inline comments
6. **Review:** Verify backward compatibility and performance impact

### **Campus Enhancement Guidelines**
1. **Backward Compatibility:** All existing functionality must remain intact
2. **Data Isolation:** Campus filtering must be applied at service layer
3. **Performance:** Campus queries must be optimized with proper indexing
4. **Security:** Campus access must be validated at API level
5. **Testing:** Campus isolation must be verified through integration tests

### **File Organization**
```
# ✅ Follow existing structure, extend with campus features
frontend/src/
├── features/
│   ├── campus/              # NEW: Campus-specific features
│   ├── auth/                # EXTEND: Add campus context
│   ├── events/              # EXTEND: Add campus filtering
│   └── dashboard/           # EXTEND: Add campus analytics
├── components/ui/           # EXISTING: ShadCN/UI components
└── lib/
    ├── campusContext.ts     # NEW: Campus state management
    └── utils.ts             # EXTEND: Add campus utilities
```

## ⚡ Performance Guidelines

### **Campus Query Optimization**
```sql
-- ✅ Always include campus_id in composite indexes
CREATE INDEX idx_events_campus_date ON events(campus_id, date);
CREATE INDEX idx_users_campus_role ON users(campus_id, role);
CREATE INDEX idx_attendance_campus_event ON attendance(campus_id, event_id);
```

### **Frontend Performance**
```typescript
// ✅ Memoize campus-filtered data
const campusEvents = useMemo(() => 
  events.filter(event => event.campusId === currentCampus?.id),
  [events, currentCampus?.id]
)

// ✅ Lazy load campus-specific components
const CampusManagement = lazy(() => import('@/features/campus/CampusManagement'))
```

## 🔒 Security Standards

### **Campus Access Control**
```typescript
// ✅ Always validate campus access
const validateCampusAccess = (user: User, requestedCampusId: number): boolean => {
  if (user.role === 'super_admin') return true
  if (user.campusId === requestedCampusId) return true
  return false
}

// ✅ Apply campus filtering at API boundaries
const getCampusFilteredData = (user: User, campusId?: number) => {
  if (!validateCampusAccess(user, campusId || user.campusId)) {
    throw new UnauthorizedError('Campus access denied')
  }
  // Fetch data...
}
```

---

## 📚 Reference Links

- **[Main Project README](../README.md)** - Project overview and structure
- **[Architecture Documentation](architecture.md)** - Technical architecture details  
- **[Frontend Architecture](frontend-brownfield-architecture.md)** - React/Vite patterns
- **[PRD Documentation](prd.md)** - Product requirements and context

---

*📝 These standards ensure consistency across AI-driven development and maintain the high quality of the EAS multi-campus enhancement project.*
